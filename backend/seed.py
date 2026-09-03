"""
Seeds a demo user with a few profiles and 7 days of realistic, per-profile
history so the dashboard has real trend data instead of shared mock deltas.

Run with:  python seed.py
"""
import json
import random
from datetime import datetime, timedelta, timezone

from app import create_app
from extensions import db
from models import User, Profile, Reading
from core.clinical_engine import run_scoring_engine

app = create_app()

DEMO_PROFILES = [
    {"name": "Kaveri (Self)", "age": 22, "sex": "F", "relation": "Self",
     "baseline_hr": 74, "baseline_spo2": 98, "baseline_systolic": 114, "baseline_diastolic": 74, "baseline_sdnn": 58},
    {"name": "Grandmother", "age": 78, "sex": "F", "relation": "Grandmother",
     "baseline_hr": 82, "baseline_spo2": 95, "baseline_systolic": 138, "baseline_diastolic": 86, "baseline_sdnn": 28},
    {"name": "Father", "age": 52, "sex": "M", "relation": "Father",
     "baseline_hr": 76, "baseline_spo2": 97, "baseline_systolic": 128, "baseline_diastolic": 82, "baseline_sdnn": 40},
]


def jitter(base, spread):
    return round(base + random.uniform(-spread, spread), 1)


def seed():
    with app.app_context():
        db.create_all()

        user = User.query.get("mock-user-123")
        if not user:
            user = User(id="mock-user-123", email="mockuser@pulsewatch.com", display_name="Demo Caregiver")
            db.session.add(user)
            db.session.commit()

        for spec in DEMO_PROFILES:
            profile = Profile.query.filter_by(owner_id=user.id, name=spec["name"]).first()
            if not profile:
                profile = Profile(
                    owner_id=user.id,
                    name=spec["name"], age=spec["age"], sex=spec["sex"], relation=spec["relation"],
                    baseline_hr=spec["baseline_hr"], baseline_spo2=spec["baseline_spo2"],
                    baseline_systolic=spec["baseline_systolic"], baseline_diastolic=spec["baseline_diastolic"],
                    baseline_sdnn=spec["baseline_sdnn"],
                )
                db.session.add(profile)
                db.session.commit()

            now = datetime.now(timezone.utc)
            for day in range(7, 0, -1):
                for hour in (8, 14, 20):
                    ts = now - timedelta(days=day, hours=(24 - hour))
                    hr = jitter(spec["baseline_hr"], 6)
                    spo2 = max(90, min(100, jitter(spec["baseline_spo2"], 1.5)))
                    sdnn_base = spec["baseline_sdnn"]
                    rr_intervals = [round(60000 / hr + random.uniform(-sdnn_base / 3, sdnn_base / 3), 1) for _ in range(20)]

                    payload = {
                        "heart_rate": hr,
                        "spo2": spo2,
                        "temperature": jitter(36.8, 0.3),
                        "systolic": jitter(spec["baseline_systolic"], 5),
                        "diastolic": jitter(spec["baseline_diastolic"], 4),
                        "rr_intervals_ms": rr_intervals,
                        "eda_microsiemens": jitter(2.2, 0.6),
                        "respiratory_rate": jitter(16, 2),
                        "consciousness": "alert",
                    }
                    result = run_scoring_engine(payload, profile=profile)

                    reading = Reading(
                        profile_id=profile.id,
                        heart_rate=payload["heart_rate"], spo2=payload["spo2"], temperature=payload["temperature"],
                        systolic=payload["systolic"], diastolic=payload["diastolic"],
                        rr_intervals_json=json.dumps(rr_intervals),
                        eda_microsiemens=payload["eda_microsiemens"], respiratory_rate=payload["respiratory_rate"],
                        consciousness="alert", result_json=json.dumps(result), recorded_at=ts,
                    )
                    db.session.add(reading)

            db.session.commit()
            print(f"Seeded {spec['name']} with 21 readings.")

        print("Done. Demo user: mock-user-123 / mockuser@pulsewatch.com")


if __name__ == "__main__":
    seed()
