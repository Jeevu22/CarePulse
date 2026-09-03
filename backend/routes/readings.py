from flask import Blueprint, request, jsonify, g

from models import Profile, Reading
from core.auth import require_auth

readings_bp = Blueprint("readings", __name__)


@readings_bp.route("/api/profiles/<profile_id>/readings", methods=["GET"])
@require_auth
def list_readings(profile_id):
    profile = Profile.query.get_or_404(profile_id)
    if profile.owner_id != g.current_user["uid"]:
        return jsonify({"error": "Forbidden"}), 403

    limit = min(int(request.args.get("limit", 100)), 500)
    readings = (
        Reading.query.filter_by(profile_id=profile_id)
        .order_by(Reading.recorded_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([r.to_dict() for r in readings])
