from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from safetensors import safe_open

class ModelService:
    _instance = None
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.max_length = 128
        self.model = None
        self.tokenizer = None
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def load_model(self, model_path: str):
        """Initialize model and tokenizer from local paths"""
        try:
            # Load tokenizer from local path
            self.tokenizer = AutoTokenizer.from_pretrained("vinai/bertweet-large")
            
            # Initialize model architecture from configuration path
            self.model = AutoModelForSequenceClassification.from_pretrained("sana-ngu/BERTweet-large-sexism-detector")

            # Load weights from the SafeTensors file
            with safe_open(model_path, framework="pt", device="cpu") as f:
                state_dict = {}
                for key in f.keys():
                    # Load each tensor into the state dictionary
                    state_dict[key] = f.get_tensor(key)

                # Load the state dict into the model
                self.model.load_state_dict(state_dict, strict=False)  # Using strict=False to handle any mismatches

            # Move model to device
            self.model = self.model.to(self.device)
            self.model.eval()  # Set the model to evaluation mode
            
            print(f"Model loaded successfully on {self.device}")
            return True
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False

    @torch.no_grad()  # Disable gradient computation for inference
    def predict(self, texts: list):
        """Make predictions for a batch of input texts"""
        encoding = self.tokenizer(
            texts,
            add_special_tokens=True,
            max_length=self.max_length,
            padding=True,  # Change to True to allow variable-length sequences
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        # Move to device
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)

        # Get predictions
        outputs = self.model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=1)

        # Get predictions
        predictions = torch.argmax(probabilities, dim=1).tolist()

        return predictions  # Return only predictions

# Initialize FastAPI app
app = FastAPI()

# Initialize model service at startup
model_service = ModelService.get_instance()
MODEL_PATH = "../models/comm/comments.safetensors"  # Path to SafeTensors weights

@app.on_event("startup")
async def startup_event():
    """Load model when server starts"""
    success = model_service.load_model(MODEL_PATH)
    if not success:
        raise Exception("Failed to load model at startup")

# Pydantic models for request/response
class BatchCommentRequest(BaseModel):
    comments: List[str]

class PredictionResponse(BaseModel):
    prediction: int
    text: str

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]
    error: Optional[str] = None

@app.post("/predict_batch", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchCommentRequest):
    """Batch prediction endpoint"""
    if not request.comments:
        raise HTTPException(status_code=400, detail="Comments list cannot be empty")
    
    predictions = []
    for comment in request.comments:
        if not comment.strip():
            predictions.append(PredictionResponse(prediction=0, text=comment))  # Handle empty comments
            continue
        try:
            prediction = model_service.predict([comment])[0]  # Call the predict method
            predictions.append(PredictionResponse(
                prediction=prediction,
                text=comment
            ))
        except Exception as e:
            predictions.append(PredictionResponse(
                prediction=0,
                text=comment
            ))

    return BatchPredictionResponse(predictions=predictions)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "device": str(model_service.device),
        "model_loaded": model_service.model is not None,
        "model_path": MODEL_PATH
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
