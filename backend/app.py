import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend access

# Initialize Firebase Admin SDK
firebase_initialized = False
firebase_cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')

if os.path.exists(firebase_cred_path):
    try:
        cred = credentials.Certificate(firebase_cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully.")
        firebase_initialized = True
    except Exception as e:
        logger.error(f"Error initializing Firebase Admin SDK: {e}")
else:
    logger.warning("Firebase credentials not found. Authentication features will run in Mock Mode.")

# Middleware: Mock verification for Firebase Auth when not initialized or in development
def verify_token(req):
    if not firebase_initialized:
        return {"uid": "mock-user-123", "email": "mockuser@pulsewatch.com"}
    
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise ValueError("Missing or invalid authorization header.")
    
    token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise ValueError("Unauthorized access.")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Service health status endpoint."""
    return jsonify({
        "status": "healthy",
        "firebase_connected": firebase_initialized,
        "environment": os.getenv('FLASK_ENV', 'development')
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict_pulse():
    """
    Placeholder endpoint for AI model predictions.
    Expects input features in JSON format.
    """
    try:
        # Verify user auth token if needed (can be bypassed for simple tests)
        user = verify_token(request)
    except ValueError as err:
        return jsonify({"error": str(err)}), 401

    data = request.get_json(silent=True) or {}
    
    # Placeholder: Input validation and preprocessing
    # Example input: {"heart_rate": 72, "spo2": 98, "systolic": 120, "diastolic": 80}
    heart_rate = data.get('heart_rate')
    spo2 = data.get('spo2')
    
    if heart_rate is None or spo2 is None:
        return jsonify({"error": "Missing required features: heart_rate, spo2"}), 400

    # Dummy AI model prediction logic (to be replaced by model in backend/models/)
    # A simple threshold/heuristic rule-based AI stub
    status = "Normal"
    recommendation = "Keep maintaining a healthy lifestyle!"
    
    if heart_rate > 100 or heart_rate < 60:
        status = "Irregular Heart Rate"
        recommendation = "Please rest and monitor your pulse. Contact a healthcare provider if symptoms persist."
    elif spo2 < 95:
        status = "Low Oxygen Level"
        recommendation = "Ensure you are in a well-ventilated area. Seek medical attention if it remains low."

    logger.info(f"Prediction generated for user {user['uid']}: {status}")

    return jsonify({
        "input_received": data,
        "prediction": {
            "status": status,
            "confidence": 0.92,
            "recommendation": recommendation
        }
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development' or True
    app.run(host='0.0.0.0', port=port, debug=debug)
