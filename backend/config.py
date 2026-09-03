"""
Pulsewatch Backend Configuration
Reads all runtime configuration from environment variables so the same
image works in local dev (SQLite + mock auth), Docker Compose, and a
real deployment (Postgres + Firebase) without code changes.
"""
import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


class Config:
    ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
    DEBUG = ENVIRONMENT == "development"

    # --- Database -----------------------------------------------------
    # In dev, defaults to a local SQLite file so `python app.py` works
    # with zero setup. In Docker/production, DATABASE_URL points at the
    # Postgres service (see docker-compose.yml).
    DATABASE_URL = os.environ.get(
        "DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'pulsewatch_dev.db')}"
    )
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    # --- Firebase -------------------------------------------------------
    FIREBASE_CREDENTIALS_PATH = os.environ.get(
        "FIREBASE_CREDENTIALS_PATH", os.path.join(BASE_DIR, "firebase-key.json")
    )

    # --- Auth -------------------------------------------------------------
    # When true (default off), unauthenticated /api/predict calls are
    # rejected even in mock mode. Keep False for local frontend dev.
    ENFORCE_AUTH = os.environ.get("ENFORCE_AUTH", "false").lower() == "true"

    # --- CORS -------------------------------------------------------------
    CORS_ORIGINS = os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")


config = Config()
