
import numpy as np
import torch
from torch import nn
from transformers import DistilBertModel
from torchvision import models
import easyocr
import io
import re
from collections import Counter
from transformers import BlipProcessor
from safetensors.torch import load_file


device = "cuda" if torch.cuda.is_available() else "cpu"

ocr_reader = easyocr.Reader(['en'])  # Add other languages if necessary
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")


# Load the model and weights
def load_classifier_model(weights_path: str, device: torch.device) -> nn.Module:
    """
    Load the MultimodalClassifier model with weights from a safetensors file.
    
    Args:
        weights_path (str): Path to the safetensors weights file
        device (torch.device): Device to load the model on
        
    Returns:
        nn.Module: Loaded model with weights
    """
    # Initialize the model
    classifier_model = MultimodalClassifier().to(device)
    
    try:
        # Load the state dict from safetensors file
        state_dict = load_file(weights_path)
        
        # Load the weights into the model
        classifier_model.load_state_dict(state_dict)
        
        # Set to evaluation mode
        classifier_model.eval()
        
        print(f"Successfully loaded weights from {weights_path}")
        return classifier_model
        
    except Exception as e:
        raise Exception(f"Error loading model weights: {str(e)}")

def filter_ocr_text(text_list):
    """Helper function to filter out watermarks and irrelevant text"""
    if not text_list:
        return "", 0.0
    
    # Common watermark patterns
    watermark_patterns = [
    r'copyright',                    # Common copyright text
    r'©\s*\d{4}',                    # Copyright symbol with a year
    r'all rights reserved',           # Copyright declaration
    r'www\.',                         # URLs with www prefix
    r'\.com',                         # URLs with .com suffix
    r'\.net',                         # URLs with .net suffix
    r'\.org',                         # URLs with .org suffix
    r'shutterstock',                  # Common stock image watermark
    r'getty images',                  # Common stock image watermark
    r'istock',                        # Common stock image watermark
    r'123rf',                         # Stock image source
    r'stock photo',                   # General stock photo indicator
    r'\d{2}/\d{2}/\d{4}',             # Date format (MM/DD/YYYY)
    r'\d{4}-\d{2}-\d{2}',             # Date format (YYYY-MM-DD)
    r'@\w+',                          # Social media handles or tags
    r'#\w+',                          # Hashtags
    r'(image|photo)\s*(source|credit)',  # Image source or credit
    r'(reproduction prohibited)',     # Copyright notice
    r'(unauthorized use)',            # Copyright restriction notice
    r'(\d{3}-\d{3}-\d{4})',           # Phone numbers
    r'created by',                    # Attribution line
    r'for editorial use only',        # Editorial-only watermark
    r'no unauthori[sz]ed reproduction', # Unauthorized reproduction notice
    r'\bwatermark\b',                 # Literal mention of "watermark"
    r'\bpreview\b',                   # Preview images
    r'\bsample\b',                    # Sample text on images
    r'illustration by',               # Attribution for illustrations
    r'(\d+(\.\d+)?)% off',            # Discount percentages
    r'promo code:?\s*\w+',            # Promo codes
    r'(limited|time) offer',          # Promotional language
    r'image id:\s*\d+',               # Image ID
    r'scan qr code',                  # QR code mention
    r'advertisement',                 # Advertisement label
    r'on sale',                       # Sale mention
    r'price:',                        # Price label
    ]

    
    filtered_texts = []
    total_score = 0.0
    
    for text in text_list:
        text = text.lower().strip()
        
        # Skip empty or very short texts
        if len(text) < 3:
            continue
            
        # Check for watermark patterns
        if any(re.search(pattern, text, re.IGNORECASE) for pattern in watermark_patterns):
            continue
        
        # Calculate relevance score
        score = 0.0
        
        # Length-based scoring
        length = len(text)
        if 10 <= length <= 50:
            score += 0.3
        elif length < 5:
            score -= 0.2
            
        # Word count scoring
        word_count = len(text.split())
        if 2 <= word_count <= 5:
            score += 0.3
            
        # Repetition penalty
        words = text.split()
        word_freq = Counter(words)
        if any(count > 2 for count in word_freq.values()):
            score -= 0.2
            
        # Special character penalty
        special_chars = sum(1 for c in text if not c.isalnum() and not c.isspace())
        if special_chars > len(text) * 0.2:
            score -= 0.3
            
        # Normalize and threshold score
        score = max(0.0, min(1.0, score + 0.5))
        
        if score > 0.3:
            filtered_texts.append(text)
            total_score += score
    
    final_text = ' '.join(filtered_texts)
    final_score = total_score / len(text_list) if text_list else 0.0
    
    return final_text, final_score

def generate_caption_with_context(image,blip, use_model=True):
    # Step 1: Convert PIL image to numpy array for EasyOCR and extract text
    image_np = np.array(image)
    ocr_results = ocr_reader.readtext(image_np, detail=0)
    filtered_text, relevance_score = filter_ocr_text(ocr_results)
    
    # Print OCR results and relevance score
    if filtered_text:
        print(f"Filtered Text (relevance score: {relevance_score:.2f}): {filtered_text}")
    else:
        print("No relevant text detected in the image")
    

    # Step 3: Generate Caption with BLIP
    if use_model:
        # Only include OCR text if it's relevant
        if relevance_score > 0.5 and filtered_text:
            prompt = f"Describe this image which contains the text: {filtered_text}"
        else:
            prompt = "Describe this image"
        prompt_tokens = prompt.split()
        if len(prompt_tokens) > 50:
            prompt = " ".join(prompt_tokens[:30])
        blip_inputs = blip_processor(images=image, text=prompt, return_tensors="pt").to(device)
        with torch.no_grad():
            output = blip.generate(**blip_inputs, max_length=50, num_return_sequences=1)
        caption = blip_processor.decode(output[0], skip_special_tokens=True)
    else:
        caption = "A simple description of the image based on key elements."
    
    return caption

# Define the Multimodal Classifier Model
class MultimodalClassifier(nn.Module):
    def __init__(self):
        super(MultimodalClassifier, self).__init__()
        # Image model
        self.cnn = models.mobilenet_v2(pretrained=True)
        self.cnn.classifier = nn.Identity()
        # Text model
        self.text_model = DistilBertModel.from_pretrained('distilbert-base-uncased')
        # Classifier
        self.classifier = nn.Sequential(
            nn.Linear(1280 + 768, 100),
            nn.BatchNorm1d(100),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(100, 50),
            nn.BatchNorm1d(50),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(50, 1),
            nn.Sigmoid()
        )
        
    def forward(self, image, input_ids, attention_mask):
        # Image features
        x_image = self.cnn.features(image)
        x_image = nn.functional.adaptive_avg_pool2d(x_image, (1, 1))
        x_image = x_image.view(x_image.size(0), -1)
        # Text features
        text_outputs = self.text_model(input_ids=input_ids, attention_mask=attention_mask)
        x_text = text_outputs.last_hidden_state[:, 0, :]  # Take [CLS] token
        # Combine features
        x = torch.cat((x_image, x_text), dim=1)
        # Classification
        x = self.classifier(x)
        return x
