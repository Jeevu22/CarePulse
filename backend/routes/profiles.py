from flask import Blueprint, request, jsonify, g

from extensions import db
from models import User, Profile
from core.auth import require_auth

profiles_bp = Blueprint("profiles", __name__)


def _ensure_user_exists():
    """Create the User row on first sight (Firebase/mock users aren't pre-seeded)."""
    user = User.query.get(g.current_user["uid"])
    if not user:
        user = User(id=g.current_user["uid"], email=g.current_user["email"])
        db.session.add(user)
        db.session.commit()
    return user


@profiles_bp.route("/api/profiles", methods=["GET"])
@require_auth
def list_profiles():
    _ensure_user_exists()
    profiles = Profile.query.filter_by(owner_id=g.current_user["uid"]).all()
    return jsonify([p.to_dict() for p in profiles])


@profiles_bp.route("/api/profiles", methods=["POST"])
@require_auth
def create_profile():
    _ensure_user_exists()
    body = request.get_json(silent=True) or {}
    if not body.get("name"):
        return jsonify({"error": "name is required"}), 400

    profile = Profile(
        owner_id=g.current_user["uid"],
        name=body["name"],
        age=body.get("age"),
        sex=body.get("sex"),
        relation=body.get("relation", "Self"),
        baseline_hr=body.get("baselineHeartRate", 72.0),
        baseline_spo2=body.get("baselineSpo2", 98.0),
        baseline_systolic=body.get("baselineSystolic", 120.0),
        baseline_diastolic=body.get("baselineDiastolic", 80.0),
        baseline_sdnn=body.get("baselineSdnn", 50.0),
    )
    db.session.add(profile)
    db.session.commit()
    return jsonify(profile.to_dict()), 201


@profiles_bp.route("/api/profiles/<profile_id>", methods=["GET"])
@require_auth
def get_profile(profile_id):
    profile = Profile.query.get_or_404(profile_id)
    if profile.owner_id != g.current_user["uid"]:
        return jsonify({"error": "Forbidden"}), 403
    return jsonify(profile.to_dict())
