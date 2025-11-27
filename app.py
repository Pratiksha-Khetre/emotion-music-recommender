# app.py
import os
import io
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from werkzeug.utils import secure_filename

# ------------- Config -------------
MODEL_PATH = os.environ.get("MODEL_PATH", "models/raf_db_model.h5")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp"}
IMG_SIZE = (75, 75)  # match your training size
CLASS_NAMES = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]
# ----------------------------------

app = Flask(__name__)
CORS(app)  # allow cross-origin for frontend on a different port

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image_bytes(image_bytes):
    """
    Read image bytes into OpenCV BGR, convert to grayscale, resize, normalize,
    and return shape (1, IMG_SIZE[0], IMG_SIZE[1], 1) float32 numpy array.
    """
    # Read bytes to numpy array
    data = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(data, cv2.IMREAD_COLOR)  # color BGR
    if img is None:
        raise ValueError("Could not decode image (cv2.imdecode returned None).")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Resize (use INTER_AREA for shrinking)
    resized = cv2.resize(gray, IMG_SIZE, interpolation=cv2.INTER_AREA)

    # Normalize to [0,1] and reshape to (1, H, W, 1)
    arr = resized.astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=-1)  # (H, W, 1)
    arr = np.expand_dims(arr, axis=0)   # (1, H, W, 1)
    return arr

# Load model at startup
print("Loading model from:", MODEL_PATH)
try:
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print("Error loading model:", e)
    model = None

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route("/api/detect-emotion", methods=["POST"])
def detect_emotion():
    """
    Endpoint to receive an image upload (multipart/form-data, key 'file'),
    preprocess identically to training (grayscale 75x75 scaled to [0,1]),
    run model.predict, and return {"emotion": label, "confidence": float_percent}
    """
    if model is None:
        return jsonify({"error": "Model not loaded on server."}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}"}), 400

    try:
        filename = secure_filename(file.filename)
        img_bytes = file.read()
        x = preprocess_image_bytes(img_bytes)

        preds = model.predict(x)  # shape (1, num_classes)
        probs = preds[0]
        best_idx = int(np.argmax(probs))
        best_prob = float(probs[best_idx])
        label = CLASS_NAMES[best_idx]

        # Confidence as percentage with two decimals
        confidence_pct = round(best_prob * 100.0, 2)

        return jsonify({
            "emotion": label,
            "confidence": confidence_pct,
            "raw_scores": probs.tolist(),  # optional: can be large
            "label_index": best_idx
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500


@app.route("/api/predict-emotion", methods=["POST"])
def predict_emotion_frame():
    """
    Optional endpoint to support your webcam loop which sends 'file' blob.
    Reuses same logic as /api/detect-emotion.
    """
    return detect_emotion()

if __name__ == "__main__":
    # Create models folder hint for local dev if absent
    os.makedirs("models", exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=False)
