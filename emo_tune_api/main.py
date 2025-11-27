from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import cv2
import numpy as np
import base64
import tensorflow as tf
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI(title="EmoTune API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== CONFIGURATION ==========
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = "http://127.0.0.1:8000/spotify/callback"

# Model configuration
MODEL_PATH = "./models/raf_db_model.h5"
CLASS_NAMES = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
IMG_HEIGHT = 75
IMG_WIDTH = 75

CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
FACE_CASCADE = cv2.CascadeClassifier(CASCADE_PATH)

spotify_tokens = {}

# ========== LOAD MODEL ==========
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("✓ Deep Learning Model loaded successfully!")
except Exception as e:
    print(f"✗ Error loading model from {MODEL_PATH}: {e}")
    print(f"   Current working directory: {os.getcwd()}")
    print(f"   Files in directory: {os.listdir('.')}")
    model = None

# ========== EMOTION TO SPOTIFY SEARCH KEYWORDS ==========
EMOTION_KEYWORDS = {
    "Happy": ["happy", "cheerful", "uplifting", "feel good", "positive"],
    "Sad": ["sad", "melancholic", "emotional", "soulful", "deep"],
    "Angry": ["angry", "aggressive", "intense", "powerful", "rock"],
    "Fear": ["scary", "horror", "dark", "ominous", "creepy"],
    "Disgust": ["edgy", "dark", "alternative", "rebellious", "punk"],
    "Surprise": ["energetic", "exciting", "upbeat", "dance", "fun"],
    "Neutral": ["relaxing", "calm", "ambient", "peaceful", "chill"],
}

# ========== LANGUAGE TO ARTIST/TRACK SEARCH KEYWORDS ==========
# Map languages to Spotify artist/track keywords
LANGUAGE_KEYWORDS = {
    "Hindi": ["hindi", "bollywood", "indian", "desi", "hindi songs"],
    "English": ["english", "pop", "rock", "rap", "american", "british"],
    "Marathi": ["marathi", "maharashtra", "marathi songs", "marathi music"],
    "Telugu": ["telugu", "telangana", "telugu songs", "telugu music"],
    "Tamil": ["tamil", "tamilnadu", "tamil songs", "tamil music"],
    "Gujarati": ["gujarati", "gujarati songs", "gujarati music", "gujarati folk"],
    "Urdu": ["urdu", "ghazal", "urdu poetry", "sufi", "qawwali"],
    "Kannada": ["kannada", "karnataka", "kannada songs", "kannada music"],
    "Bengali": ["bengali", "bengal", "bengali songs", "bengali folk"],
    "Malayalam": ["malayalam", "kerala", "malayalam songs", "malayalam music"],
}

# ========== SPOTIFY FUNCTIONS ==========

@app.get("/spotify/login")
async def spotify_login():
    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": "streaming user-read-private user-read-email",
    }
    auth_url = f"https://accounts.spotify.com/authorize?{urlencode(params)}"
    return {"auth_url": auth_url}

@app.get("/spotify/callback")
async def spotify_callback(code: str = Query(None), error: str = Query(None)):
    if error:
        return HTMLResponse("<html><body style='background: #0f0f1c; color: #f0f0f0; font-family: Arial; padding: 50px; text-align: center;'><h2>Error connecting to Spotify</h2><script>window.close();</script></body></html>")
    
    try:
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "client_id": SPOTIFY_CLIENT_ID,
            "client_secret": SPOTIFY_CLIENT_SECRET,
        }
        
        response = requests.post("https://accounts.spotify.com/api/token", data=token_data)
        tokens = response.json()
        spotify_tokens["current_user"] = tokens
        
        return HTMLResponse("<html><body style='background: #0f0f1c; color: #f0f0f0; font-family: Arial; padding: 50px; text-align: center;'><h2>Connected to Spotify!</h2><p>You can close this window.</p><script>setTimeout(() => window.close(), 1500);</script></body></html>")
    except Exception as e:
        return HTMLResponse(f"<html><body style='background: #0f0f1c; color: #f0f0f0; font-family: Arial; padding: 50px; text-align: center;'><h2>Error: {str(e)}</h2></body></html>")

def get_spotify_token():
    """Get a valid Spotify API token"""
    try:
        if "current_user" not in spotify_tokens:
            auth_str = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
            auth_bytes = base64.b64encode(auth_str.encode()).decode()
            headers = {
                "Authorization": f"Basic {auth_bytes}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            data = {"grant_type": "client_credentials"}
            response = requests.post(
                "https://accounts.spotify.com/api/token",
                headers=headers,
                data=data
            )
            if response.status_code == 200:
                token = response.json().get("access_token")
                return token
            else:
                return None
        else:
            token = spotify_tokens["current_user"].get("access_token")
            return token
    except Exception as e:
        print(f"Error getting Spotify token: {e}")
        return None

def search_spotify_tracks_by_emotion_and_language(emotion, language):
    """
    Search Spotify for tracks based on BOTH emotion keywords AND language keywords
    This combines emotional context with user's language preference
    """
    try:
        token = get_spotify_token()
        if not token:
            print("Could not get Spotify token")
            return []
        
        if emotion not in EMOTION_KEYWORDS:
            emotion = "Neutral"
        
        if language not in LANGUAGE_KEYWORDS:
            language = "English"
        
        # Get keywords for emotion and language
        emotion_keywords = EMOTION_KEYWORDS[emotion]
        language_keywords = LANGUAGE_KEYWORDS[language]
        all_tracks = []
        
        print(f"\n🎵 Searching Spotify for {emotion} + {language} songs")
        print(f"   Emotion keywords: {emotion_keywords}")
        print(f"   Language keywords: {language_keywords}")
        
    
        
        for emotion_kw in emotion_keywords[:3]:  # Use first 3 emotion keywords
            for lang_kw in language_keywords[:2]:  # Use first 2 language keywords
                try:
                    # Combine emotion and language keywords
                    combined_query = f"{emotion_kw} {lang_kw}"
                    
                    search_response = requests.get(
                        "https://api.spotify.com/v1/search",
                        headers={"Authorization": f"Bearer {token}"},
                        params={
                            "q": combined_query,
                            "type": "track",
                            "limit": 15,
                            "market": "US"
                        }
                    )
                    
                    if search_response.status_code == 200:
                        results = search_response.json()
                        tracks = results.get("tracks", {}).get("items", [])
                        
                        for track in tracks:
                            # Avoid duplicates
                            if not any(t["id"] == track["id"] for t in all_tracks):
                                album_image = ""
                                if track.get("album", {}).get("images"):
                                    album_image = track["album"]["images"][0]["url"]
                                
                                embed_url = f"https://open.spotify.com/embed/track/{track['id']}"
                                
                                track_data = {
                                    "id": track["id"],
                                    "title": track["name"],
                                    "artist": ", ".join([a["name"] for a in track["artists"]]),
                                    "image_url": album_image,
                                    "external_url": track.get("external_urls", {}).get("spotify", ""),
                                    "embed_url": embed_url,
                                }
                                all_tracks.append(track_data)
                        
                except Exception as e:
                    print(f"  ⚠ Error searching '{combined_query}': {e}")
                    continue
        
        # If combined search doesn't yield enough results, fall back to emotion-only search
        if len(all_tracks) < 10:
            print(f"  ℹ Only {len(all_tracks)} tracks found with combined search, adding more from emotion search...")
            
            for emotion_kw in emotion_keywords:
                try:
                    search_response = requests.get(
                        "https://api.spotify.com/v1/search",
                        headers={"Authorization": f"Bearer {token}"},
                        params={
                            "q": emotion_kw,
                            "type": "track",
                            "limit": 20,
                            "market": "US"
                        }
                    )
                    
                    if search_response.status_code == 200:
                        results = search_response.json()
                        tracks = results.get("tracks", {}).get("items", [])
                        
                        for track in tracks:
                            if not any(t["id"] == track["id"] for t in all_tracks):
                                album_image = ""
                                if track.get("album", {}).get("images"):
                                    album_image = track["album"]["images"][0]["url"]
                                
                                embed_url = f"https://open.spotify.com/embed/track/{track['id']}"
                                
                                track_data = {
                                    "id": track["id"],
                                    "title": track["name"],
                                    "artist": ", ".join([a["name"] for a in track["artists"]]),
                                    "image_url": album_image,
                                    "external_url": track.get("external_urls", {}).get("spotify", ""),
                                    "embed_url": embed_url,
                                }
                                all_tracks.append(track_data)
                            
                            if len(all_tracks) >= 20:
                                break
                    
                    if len(all_tracks) >= 20:
                        break
                        
                except Exception as e:
                    print(f"  ⚠ Error searching '{emotion_kw}': {e}")
                    continue
        
        print(f"  📊 Total unique tracks found: {len(all_tracks)}")
        return all_tracks[:20]
        
    except Exception as e:
        print(f"Error searching Spotify: {e}")
        return []

# ========== EMOTION DETECTION & PROCESSING ==========

def process_and_predict(image_file_bytes):
    """
    Handles face detection, prediction, drawing, and encoding.
    Uses the working model's preprocessing (75x75 grayscale).
    """
    if model is None:
        raise Exception("Model not loaded")
    
    # 1. Decode Image
    nparr = np.frombuffer(image_file_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise Exception("Invalid image format")
    
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # 2. Detect Faces
    faces = FACE_CASCADE.detectMultiScale(img_gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    if len(faces) == 0:
        raise Exception("No face detected in the image frame.")
    
    # Process largest face
    (x, y, w, h) = max(faces, key=lambda rect: rect[2] * rect[3])
    
    # 3. Extract and Preprocess Face for Model
    face_roi = img_gray[y:y+h, x:x+w]
    face_resized = cv2.resize(face_roi, (IMG_WIDTH, IMG_HEIGHT))
    
    # Preprocessing for model
    processed_input = face_resized.astype('float32') / 255.0
    processed_input = np.expand_dims(processed_input, axis=-1)
    processed_input = np.expand_dims(processed_input, axis=0)
    
    # 4. Make Prediction
    predictions = model.predict(processed_input, verbose=0)
    probabilities = predictions[0]
    predicted_index = np.argmax(probabilities)
    predicted_emotion = CLASS_NAMES[predicted_index]
    confidence = float(probabilities[predicted_index])
    
    # 5. Draw Bounding Box and Text on Original Image
    cv2.rectangle(img_bgr, (x, y), (x+w, y+h), (0, 255, 0), 2)
    text = f"{predicted_emotion} ({confidence*100:.1f}%)"
    cv2.putText(
        img_bgr, 
        text, 
        (x, y - 10), 
        cv2.FONT_HERSHEY_SIMPLEX, 
        0.9, 
        (0, 255, 0),
        2
    )
    
    # 6. Encode Processed Image to Base64
    _, buffer = cv2.imencode('.jpeg', img_bgr)
    processed_image_b64 = 'data:image/jpeg;base64,' + base64.b64encode(buffer.tobytes()).decode('utf-8')
    
    return {
        "processed_image_b64": processed_image_b64,
        "predicted_emotion": predicted_emotion,
        "confidence": confidence,
        "all_confidences": {CLASS_NAMES[i]: round(float(probabilities[i]), 4) for i in range(len(CLASS_NAMES))}
    }

@app.post("/analyze_emotion/")
async def analyze_emotion(file: UploadFile = File(...)):
    """Analyze emotion from uploaded image"""
    try:
        image_bytes = await file.read()
        result = process_and_predict(image_bytes)
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== RECOMMENDATIONS ==========

@app.get("/get_recommendations/")
async def get_recommendations(
    emotion: str = Query("Neutral"), 
    languages: str = Query("English"),
    offset: int = Query(0)
):
    """
    Get song recommendations based on BOTH emotion AND selected languages with pagination
    """
    
    # Parse languages
    language_list = [lang.strip() for lang in languages.split(",") if lang.strip()]
    
    if not language_list:
        language_list = ["English"]
    
    print(f"\n📍 RECOMMENDATION REQUEST:")
    print(f"   Emotion: {emotion}")
    print(f"   Languages: {language_list}")
    print(f"   Offset: {offset}")
    
    # Collect ALL results from each language (cache them)
    all_recommendations = []
    
    for language in language_list:
        print(f"\n   🔍 Searching {language}...")
        language_results = search_spotify_tracks_by_emotion_and_language(emotion, language)
        
        # Tag each track with language
        for track in language_results:
            track["language"] = language
            # Avoid duplicates
            if not any(t["id"] == track["id"] for t in all_recommendations):
                all_recommendations.append(track)
    
    print(f"\n   📊 Summary:")
    print(f"      Total tracks found: {len(all_recommendations)}")
    print(f"      Requested offset: {offset}")
    print(f"      Will return tracks from index {offset} to {offset + 20}")
    
    # Apply offset and return 20 songs
    paginated_recommendations = all_recommendations[offset:offset + 20]
    
    print(f"      Actually returning: {len(paginated_recommendations)} tracks")
    
    if len(paginated_recommendations) == 0 and offset > 0:
        print(f"      ⚠️ No more songs available at this offset")
    
    return {
        "recommendations": paginated_recommendations,
        "emotion": emotion,
        "languages": language_list,
        "total_available": len(all_recommendations),
        "offset": offset,
        "returned_count": len(paginated_recommendations)
    }

# ========== HEALTH CHECK ==========

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "spotify_configured": bool(SPOTIFY_CLIENT_ID)
    }

@app.get("/")
async def root():
    return {"message": "EmoTune API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)