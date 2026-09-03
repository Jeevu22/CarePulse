"""
Auth layer.

- If a Firebase service-account key is present (FIREBASE_CREDENTIALS_PATH),
  Firebase Admin SDK is initialized and every protected route requires a
  real `Authorization: Bearer <firebase-id-token>` header, verified
  server-side via firebase_admin.auth.verify_id_token.
- If no key is present, the backend falls back to the documented mock
  identity (mock-user-123) so local frontend development keeps working
  without provisioning cloud credentials. This state is reported honestly
  by GET /api/health as `firebase_connected: false`.
"""
import os
import functools
from flask import request, jsonify, g

firebase_app = None
FIREBASE_CONNECTED = False

MOCK_USER = {"uid": "mock-user-123", "email": "mockuser@pulsewatch.com"}


def init_firebase(credentials_path: str):
    global firebase_app, FIREBASE_CONNECTED
    if not os.path.exists(credentials_path):
        FIREBASE_CONNECTED = False
        return False
    try:
        import firebase_admin
        from firebase_admin import credentials

        cred = credentials.Certificate(credentials_path)
        firebase_app = firebase_admin.initialize_app(cred)
        FIREBASE_CONNECTED = True
        return True
    except Exception as exc:  # pragma: no cover - defensive
        print(f"[firebase] failed to initialize: {exc}")
        FIREBASE_CONNECTED = False
        return False


def _verify_token(id_token: str):
    from firebase_admin import auth as firebase_auth

    decoded = firebase_auth.verify_id_token(id_token)
    return {"uid": decoded["uid"], "email": decoded.get("email", "")}


def require_auth(fn):
    """
    Attaches g.current_user = {"uid": ..., "email": ...}.
    Real verification when Firebase is connected; documented mock
    identity otherwise (unless ENFORCE_AUTH=true, in which case a
    missing/invalid token is rejected even in mock mode).
    """

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        from config import config

        auth_header = request.headers.get("Authorization", "")
        token = auth_header.split(" ", 1)[1] if auth_header.startswith("Bearer ") else None

        if FIREBASE_CONNECTED:
            if not token:
                return jsonify({"error": "Missing Authorization Bearer token"}), 401
            try:
                g.current_user = _verify_token(token)
            except Exception as exc:
                return jsonify({"error": "Invalid or expired token", "detail": str(exc)}), 401
        else:
            if config.ENFORCE_AUTH and not token:
                return jsonify({"error": "Missing Authorization Bearer token"}), 401
            g.current_user = MOCK_USER

        return fn(*args, **kwargs)

    return wrapper
