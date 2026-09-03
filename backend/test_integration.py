import json
import urllib.request

BASE_URL = "http://127.0.0.1:5000"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))

def post(path, body):
    payload = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))

if __name__ == "__main__":
    health = get("/api/health")
    print("[1] HEALTH:", health)

    profiles = get("/api/profiles")
    print(f"[2] PROFILES ({len(profiles)} found):", [p["name"] for p in profiles])

    pid = profiles[0]["id"]
    predict_res = post("/api/predict", {
        "profile_id": pid,
        "heart_rate": 76,
        "spo2": 98,
        "temperature": 36.8,
        "systolic": 118,
        "diastolic": 76,
        "ptt_ms": 248,
        "eda_microsiemens": 2.1,
        "respiratory_rate": 16,
        "consciousness": "alert",
    })
    print("[3] PREDICT RESULT:", predict_res["status"], predict_res["engine"], "Reading ID:", predict_res.get("readingId"))
    print("    MODULES:", list(predict_res["result"]["modules"].keys()))

    readings = get(f"/api/profiles/{pid}/readings?limit=3")
    print(f"[4] READINGS for {profiles[0]['name']} ({len(readings)} returned): Latest HR={readings[0]['heartRate']}, SpO2={readings[0]['spo2']}")

    alerts = get(f"/api/profiles/{pid}/alerts")
    print(f"[5] ALERTS ({len(alerts)} found)")

    print("\nALL INTEGRATION ENDPOINTS VERIFIED SUCCESSFULLY!")
