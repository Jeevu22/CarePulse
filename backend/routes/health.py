from flask import Blueprint, jsonify
from config import config
from core.auth import FIREBASE_CONNECTED
from extensions import db
from sqlalchemy import text

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health", methods=["GET"])
def health():
    db_connected = False
    try:
        db.session.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    return jsonify(
        {
            "status": "healthy",
            "firebase_connected": FIREBASE_CONNECTED,
            "database_connected": db_connected,
            "environment": config.ENVIRONMENT,
        }
    )
