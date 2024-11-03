from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import List
import torch
from transformers import DistilBertTokenizer, BlipForConditionalGeneration
from img_depend import MultimodalClassifier, generate_caption_with_context
from PIL import Image
import io

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Initialize models once
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)
classifier_model = MultimodalClassifier().to(device)
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
max_length = 128

# Initialize FastAPI app
app = FastAPI()

class BatchPredictionResponse(BaseModel):
    predictions: List[int]

def process_image(image_data: bytes):
    """Converts image bytes to a PIL Image."""
    try:
        image = Image.open(io.BytesIO(image_data))
        return image.convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

def generate_predictions(images: List[Image.Image]):
    """Generates binary predictions for a batch of images."""
    predictions = []
    for image in images:
        # Generate caption
        caption = generate_caption_with_context(image, blip_model, return_text=True)
        
        # Tokenize caption
        encoding = tokenizer(
            caption,
            add_special_tokens=True,
            max_length=max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        ).to(device)
        
        # Make prediction
        with torch.inference_mode():
            output = classifier_model(blip_model, caption, encoding)
            prediction = torch.argmax(output.logits, dim=1).item()  # Assuming binary classification logits
            predictions.append(prediction)
    
    return predictions

@app.post("/predict_batch", response_model=BatchPredictionResponse)
async def predict_batch(files: List[UploadFile] = File(...)):
    """Endpoint to handle batch image predictions."""
    try:
        # Load and process each image in the batch
        images = [process_image(await file.read()) for file in files]
        
        # Generate predictions
        predictions = generate_predictions(images)
        
        return BatchPredictionResponse(predictions=predictions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
