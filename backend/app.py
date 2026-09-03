"""
Pulsewatch Backend — Flask API
Run locally with:  python app.py
Run in Docker via: gunicorn -b 0.0.0.0:5000 app:app
"""
import os
from flask import Flask, jsonify, request

from config import config
from extensions import db, cors
from core.auth import init_firebase


def create_app():
    app = Flask(__name__)
    app.config.from_object(config)

    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})

    init_firebase(config.FIREBASE_CREDENTIALS_PATH)

    from routes.health import health_bp
    from routes.predict import predict_bp
    from routes.profiles import profiles_bp
    from routes.readings import readings_bp
    from routes.alerts import alerts_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(profiles_bp)
    app.register_blueprint(readings_bp)
    app.register_blueprint(alerts_bp)

    with app.app_context():
        db.create_all()

    @app.route("/")
    def index():
        return jsonify(
            {
                "service": "pulsewatch-backend",
                "status": "running",
                "try": ["/api/health", "/api/profiles", "/api/predict (POST)"],
            }
        )

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found", "path": request.path}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=config.DEBUG)
