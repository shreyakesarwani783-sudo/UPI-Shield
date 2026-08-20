import pickle
import numpy as np
import os
import sys

# ml/ folder ka path add karo taaki features.py import ho sake
ML_DIR = os.path.join(os.path.dirname(__file__), "..", "ml")
sys.path.insert(0, os.path.abspath(ML_DIR))

from features import extract_features_from_url, get_feature_names

# Model load karo
MODEL_PATH = os.path.join(ML_DIR, "model.pkl")

model = None

def load_model():
    global model
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print("[ML] Model loaded successfully!")
    except Exception as e:
        print(f"[ML] Could not load model: {e}")
        model = None

def predict(url: str) -> dict:
    if model is None:
        return {"ml_score": 50, "ml_confidence": 0.0, "ml_available": False}

    try:
        feature_names = get_feature_names()
        features = extract_features_from_url(url)
        X = np.array([[features[name] for name in feature_names]])

        prediction = model.predict(X)[0]           # 0 = legitimate, 1 = phishing
        probabilities = model.predict_proba(X)[0]  # [prob_legit, prob_phishing]

        phishing_prob = probabilities[1]
        ml_score = int(phishing_prob * 100)

        return {
            "ml_score": ml_score,
            "ml_prediction": int(prediction),
            "ml_confidence": round(float(phishing_prob), 3),
            "ml_available": True
        }

    except Exception as e:
        print(f"[ML] Prediction error: {e}")
        return {"ml_score": 50, "ml_confidence": 0.0, "ml_available": False}