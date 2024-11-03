import requests
import json

# Define the base URL for the FastAPI server
base_url = "http://127.0.0.1:8000"  # Adjust if the server runs on a different IP or port

# Sample batch of comments to test sexism detection
sample_comments = [
    "Women are too emotional to handle tough jobs.",
    "He's so competent and professional.",
    "All women should stay in the kitchen.",
    "Everyone deserves equal opportunities regardless of gender.",
    "She’s great at her job and very capable."
]

# Prepare the batch request payload
batch_request_payload = {"comments": sample_comments}

# Define the function to test the batch prediction
def test_batch_prediction():
    response = requests.post(f"{base_url}/predict_batch", json=batch_request_payload)

    if response.status_code == 200:
        batch_response = response.json()
        print("Batch Prediction Results:")
        for prediction in batch_response['predictions']:
            print(f"Text: {prediction['text']}")
            print(f"Prediction: {prediction['prediction']}")
            print(f"Confidence: {prediction['confidence']}\n")
        if batch_response.get("error"):
            print("Errors:", batch_response["error"])
    else:
        print("Request failed with status:", response.status_code)
        print("Detail:", response.json())

if __name__ == "__main__":
    test_batch_prediction()
