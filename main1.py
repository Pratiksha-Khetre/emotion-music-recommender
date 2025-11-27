# Save this as main.py
# Add this import at the top of main.py, near other imports
import base64 
import uvicorn
import io
import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2  # New import for OpenCV

# --- Configuration ---
MODEL_PATH = './raf_db_model.h5' 
CLASS_NAMES = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
# Model input dimensions (75x75 grayscale)
IMG_HEIGHT = 75
IMG_WIDTH = 75
# Path to OpenCV's pre-trained face detector (download if needed or use system path)
# This file is commonly included with the opencv-python installation
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# --- Model Loading ---
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("Deep Learning Model loaded successfully!")
except Exception as e:
    print(f"FATAL ERROR: Model failed to load from {MODEL_PATH}. Error: {e}")
    model = None

# --- FastAPI Initialization & CORS ---
app = FastAPI(title="Facial Emotion Recognition API")
origins = ["*"] # Use your specific frontend URL in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Define Response Schema ---
class PredictionResponse(BaseModel):
    # Base64 string of the image with the bounding box
    processed_image_b64: str
    predicted_emotion: str
    confidence: float
    all_confidences: dict

# --- CORE PROCESSING FUNCTION ---
def process_and_predict(image_file_bytes):
    """Handles face detection, prediction, drawing, and encoding."""
    
    # 1. Decode Image (from bytes to OpenCV format)
    nparr = np.frombuffer(image_file_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # 2. Detect Faces
    faces = FACE_CASCADE.detectMultiScale(img_gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    if len(faces) == 0:
        raise HTTPException(status_code=404, detail="No face detected in the image frame.")

    # Always process the largest face if multiple are found
    (x, y, w, h) = max(faces, key=lambda rect: rect[2] * rect[3])

    # 3. Extract and Preprocess Face for Model
    face_roi = img_gray[y:y+h, x:x+w]
    face_resized = cv2.resize(face_roi, (IMG_WIDTH, IMG_HEIGHT))
    
    # Preprocessing for model (rescale and reshape)
    processed_input = face_resized.astype('float32') / 255.0
    processed_input = np.expand_dims(processed_input, axis=-1)
    processed_input = np.expand_dims(processed_input, axis=0)

    # 4. Make Prediction
    predictions = model.predict(processed_input)
    probabilities = predictions[0]
    predicted_index = np.argmax(probabilities)
    predicted_emotion = CLASS_NAMES[predicted_index]
    confidence = float(probabilities[predicted_index])
    
    # 5. Draw Bounding Box and Text on Original Image (BGR)
    cv2.rectangle(img_bgr, (x, y), (x+w, y+h), (0, 255, 0), 2) # Green box
    
    text = f"{predicted_emotion} ({confidence*100:.1f}%)"
    cv2.putText(
        img_bgr, 
        text, 
        (x, y - 10), 
        cv2.FONT_HERSHEY_SIMPLEX, 
        0.9, 
        (0, 255, 0), # Green text
        2
    )

    # 6. Encode Processed Image to Base64 (JPEG)
    _, buffer = cv2.imencode('.jpeg', img_bgr)
    processed_image_b64 = 'data:image/jpeg;base64,' + base64.b64encode(buffer.tobytes()).decode('utf-8')
    
    return {
        "processed_image_b64": processed_image_b64,
        "predicted_emotion": predicted_emotion,
        "confidence": confidence,
        "all_confidences": {CLASS_NAMES[i]: round(float(probabilities[i]), 4) for i in range(len(CLASS_NAMES))}
    }

# --- API Endpoint ---
@app.post("/analyze_emotion/", response_model=PredictionResponse)
async def analyze_emotion(file: UploadFile = File(..., description="Image file for emotion analysis")):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Server is unavailable.")

    image_bytes = await file.read()
    
    # The core logic is now in a reusable function
    return process_and_predict(image_bytes)

# --- Health Check ---
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Emotion Recognition API is running"}