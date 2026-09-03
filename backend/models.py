"""
Pulsewatch data model.

Design notes:
- `Profile` = a monitored family member (may or may not have their own
  login — elderly users are often monitored by a caregiver account).
- `Reading` stores raw sensor input AND the scoring engine's output for
  that reading, so history/trends never have to be recomputed or mocked.
- `Alert` is generated automatically when a reading crosses a threshold
  defined in core/clinical_engine.py, and can also be created manually.
"""
import uuid
from datetime import datetime, timezone

from extensions import db


def _uuid():
    return str(uuid.uuid4())


class User(db.Model):
    """A Firebase-authenticated account (caregiver or self-monitoring adult)."""

    __tablename__ = "users"

    id = db.Column(db.String(64), primary_key=True)  # Firebase UID (or mock-user-123)
    email = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    profiles = db.relationship("Profile", backref="owner", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "displayName": self.display_name,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Profile(db.Model):
    """A person being monitored (e.g. grandparent, self, family member)."""

    __tablename__ = "profiles"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    owner_id = db.Column(db.String(64), db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    sex = db.Column(db.String(20))
    relation = db.Column(db.String(50))  # e.g. "Self", "Grandmother"

    # Baselines used so trend deltas are computed per-person, not shared
    # mock constants (this was a known credibility bug — see notes).
    baseline_hr = db.Column(db.Float, default=72.0)
    baseline_spo2 = db.Column(db.Float, default=98.0)
    baseline_systolic = db.Column(db.Float, default=120.0)
    baseline_diastolic = db.Column(db.Float, default=80.0)
    baseline_sdnn = db.Column(db.Float, default=50.0)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    readings = db.relationship(
        "Reading", backref="profile", lazy=True, order_by="Reading.recorded_at.desc()"
    )
    alerts = db.relationship(
        "Alert", backref="profile", lazy=True, order_by="Alert.created_at.desc()"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "ownerId": self.owner_id,
            "name": self.name,
            "age": self.age,
            "sex": self.sex,
            "relation": self.relation,
            "baseline": {
                "heartRate": self.baseline_hr,
                "spo2": self.baseline_spo2,
                "systolic": self.baseline_systolic,
                "diastolic": self.baseline_diastolic,
                "sdnn": self.baseline_sdnn,
            },
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Reading(db.Model):
    """One ingested sensor snapshot + the scoring engine's output for it."""

    __tablename__ = "readings"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    profile_id = db.Column(db.String(36), db.ForeignKey("profiles.id"), nullable=False)

    # Raw sensor inputs
    heart_rate = db.Column(db.Float)
    spo2 = db.Column(db.Float)
    temperature = db.Column(db.Float)
    systolic = db.Column(db.Float)
    diastolic = db.Column(db.Float)
    ptt_ms = db.Column(db.Float)          # pulse transit time, for PTT-based BP
    rr_intervals_json = db.Column(db.Text)  # JSON list of RR intervals (ms) for HRV
    eda_microsiemens = db.Column(db.Float)  # raw EDA/GSR reading
    respiratory_rate = db.Column(db.Float)
    consciousness = db.Column(db.String(20), default="alert")  # NEWS2 input

    # Scoring engine output (persisted so trends don't get recomputed
    # differently every time the UI renders them)
    result_json = db.Column(db.Text)

    recorded_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        import json

        return {
            "id": self.id,
            "profileId": self.profile_id,
            "heartRate": self.heart_rate,
            "spo2": self.spo2,
            "temperature": self.temperature,
            "bp": {"systolic": self.systolic, "diastolic": self.diastolic},
            "pttMs": self.ptt_ms,
            "edaMicrosiemens": self.eda_microsiemens,
            "respiratoryRate": self.respiratory_rate,
            "consciousness": self.consciousness,
            "result": json.loads(self.result_json) if self.result_json else None,
            "recordedAt": self.recorded_at.isoformat() if self.recorded_at else None,
        }


class Alert(db.Model):
    """A flagged risk-screening event, generated by the engine or manually."""

    __tablename__ = "alerts"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    profile_id = db.Column(db.String(36), db.ForeignKey("profiles.id"), nullable=False)
    reading_id = db.Column(db.String(36), db.ForeignKey("readings.id"), nullable=True)

    category = db.Column(db.String(50), nullable=False)  # heart | bp | deterioration | stress
    severity = db.Column(db.String(20), nullable=False)  # info | warning | critical
    message = db.Column(db.String(500), nullable=False)
    acknowledged = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "profileId": self.profile_id,
            "readingId": self.reading_id,
            "category": self.category,
            "severity": self.severity,
            "message": self.message,
            "acknowledged": self.acknowledged,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
