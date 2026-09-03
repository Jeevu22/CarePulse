from flask import Blueprint, request, jsonify, g

from extensions import db
from models import Profile, Alert
from core.auth import require_auth

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/api/profiles/<profile_id>/alerts", methods=["GET"])
@require_auth
def list_alerts(profile_id):
    profile = Profile.query.get_or_404(profile_id)
    if profile.owner_id != g.current_user["uid"]:
        return jsonify({"error": "Forbidden"}), 403

    query = Alert.query.filter_by(profile_id=profile_id)
    if request.args.get("unacknowledged") == "true":
        query = query.filter_by(acknowledged=False)
    alerts = query.order_by(Alert.created_at.desc()).limit(200).all()
    return jsonify([a.to_dict() for a in alerts])


@alerts_bp.route("/api/alerts/<alert_id>/acknowledge", methods=["POST"])
@require_auth
def acknowledge_alert(alert_id):
    alert = Alert.query.get_or_404(alert_id)
    profile = Profile.query.get_or_404(alert.profile_id)
    if profile.owner_id != g.current_user["uid"]:
        return jsonify({"error": "Forbidden"}), 403

    alert.acknowledged = True
    db.session.commit()
    return jsonify(alert.to_dict())
