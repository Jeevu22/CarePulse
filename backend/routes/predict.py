import json
from flask import Blueprint, request, jsonify, g

from extensions import db
from models import Profile, Reading, Alert
from core.auth import require_auth
from core.clinical_engine import run_scoring_engine

predict_bp = Blueprint("predict", __name__)

REQUIRED_FIELDS = ["heart_rate", "spo2"]

# category -> which module result drives it, used to auto-generate alerts
_ALERT_CATEGORY_MAP = {
    "heartDisease": "heart",
    "hypertension": "bp",
    "deterioration": "deterioration",
    "stress": "stress",
}
_ALERT_SEVERITY_MAP = {
    "elevated": "info",
    "moderate": "warning",
    "high": "warning",
    "critical": "critical",
}


@predict_bp.route("/api/predict", methods=["POST"])
@require_auth
def predict():
    body = request.get_json(silent=True) or {}

    missing = [f for f in REQUIRED_FIELDS if body.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing required field(s): {', '.join(missing)}"}), 400

    profile_id = body.get("profile_id")
    profile = Profile.query.get(profile_id) if profile_id else None

    bp = body.get("bp") or {}
    payload = {
        "heart_rate": body.get("heart_rate"),
        "spo2": body.get("spo2"),
        "temperature": body.get("temperature"),
        "systolic": bp.get("systolic") if bp.get("systolic") is not None else body.get("systolic"),
        "diastolic": bp.get("diastolic") if bp.get("diastolic") is not None else body.get("diastolic"),
        "ptt_ms": body.get("ptt_ms"),
        "rr_intervals_ms": body.get("rr_intervals_ms"),
        "eda_microsiemens": body.get("eda_microsiemens"),
        "respiratory_rate": body.get("respiratory_rate"),
        "consciousness": body.get("consciousness", "alert"),
    }

    result = run_scoring_engine(payload, profile=profile)

    reading = None
    if profile is not None:
        reading = Reading(
            profile_id=profile.id,
            heart_rate=payload["heart_rate"],
            spo2=payload["spo2"],
            temperature=payload["temperature"],
            systolic=payload["systolic"],
            diastolic=payload["diastolic"],
            ptt_ms=payload["ptt_ms"],
            rr_intervals_json=json.dumps(payload["rr_intervals_ms"]) if payload["rr_intervals_ms"] else None,
            eda_microsiemens=payload["eda_microsiemens"],
            respiratory_rate=payload["respiratory_rate"],
            consciousness=payload["consciousness"],
            result_json=json.dumps(result),
        )
        db.session.add(reading)
        db.session.flush()  # get reading.id before commit

        # Auto-generate alerts for any module at moderate-or-worse band
        for module_key, module_result in result["modules"].items():
            if not module_result.get("available"):
                continue
            band = module_result.get("band")
            if band in ("moderate", "high", "critical", "elevated") and band != "normal":
                severity = _ALERT_SEVERITY_MAP.get(band, "info")
                if band == "elevated":
                    continue  # too minor to alert on, still visible in the reading
                alert = Alert(
                    profile_id=profile.id,
                    reading_id=reading.id,
                    category=_ALERT_CATEGORY_MAP.get(module_key, module_key),
                    severity=severity,
                    message=module_result.get("label", "Risk flagged"),
                )
                db.session.add(alert)

        db.session.commit()

    response = {
        "status": result["overallBand"] or "normal",
        "engine": "clinically-grounded-scoring-engine-v1",
        "result": result,
    }
    if reading:
        response["readingId"] = reading.id

    return jsonify(response)
