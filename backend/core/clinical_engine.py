"""
Pulsewatch Clinically-Grounded Scoring Engine
==============================================

IMPORTANT FRAMING: this is a rule-based risk-SCREENING engine, grounded
in named clinical frameworks. It is NOT a trained machine-learning model
and must never be described as one in the UI, docs, or viva answers.
It does not diagnose; it flags patterns worth a clinician's attention.

Four modules, each independently computable from whatever sensor fields
are present in a given reading:

1. Heart Disease risk  -> HRV time-domain indices (SDNN, RMSSD)
2. Hypertension risk   -> PTT-derived BP, staged per AHA/ACC 2017 guideline
3. Physiological Deterioration -> adapted NEWS2 (National Early Warning Score 2)
4. Stress index        -> Electrodermal Activity (EDA/GSR) tonic-level index

Each module returns:
    { available, score, band, label, detail }
`available=False` means the required sensor field(s) were missing from
this reading, so the module is skipped rather than guessed at.
"""
import math
import statistics
from typing import Optional, List, Dict, Any


# ---------------------------------------------------------------------------
# 1. Heart Disease risk — HRV (SDNN, RMSSD)
# ---------------------------------------------------------------------------
def score_hrv(rr_intervals_ms: Optional[List[float]], heart_rate: Optional[float]) -> Dict[str, Any]:
    """
    SDNN: standard deviation of NN (RR) intervals — overall HRV / autonomic tone.
    RMSSD: root mean square of successive differences — short-term/parasympathetic tone.
    Reference bands are the commonly cited short-term (~5 min) clinical ranges;
    low SDNN/RMSSD is an established correlate of elevated cardiovascular risk.
    """
    if not rr_intervals_ms or len(rr_intervals_ms) < 5:
        return {
            "available": False,
            "score": None,
            "band": None,
            "label": "Insufficient HRV data",
            "detail": "Need >=5 consecutive RR intervals (ms) to compute SDNN/RMSSD.",
        }

    sdnn = statistics.pstdev(rr_intervals_ms)
    diffs = [rr_intervals_ms[i + 1] - rr_intervals_ms[i] for i in range(len(rr_intervals_ms) - 1)]
    rmssd = math.sqrt(sum(d * d for d in diffs) / len(diffs)) if diffs else 0.0

    if sdnn < 30:
        band, label = "high", "Low HRV — elevated cardiac risk pattern"
    elif sdnn < 50:
        band, label = "moderate", "Below-average HRV"
    else:
        band, label = "normal", "Healthy HRV range"

    return {
        "available": True,
        "score": round(sdnn, 1),
        "band": band,
        "label": label,
        "detail": f"SDNN={sdnn:.1f} ms, RMSSD={rmssd:.1f} ms (n={len(rr_intervals_ms)} intervals)",
        "metrics": {"sdnn_ms": round(sdnn, 1), "rmssd_ms": round(rmssd, 1)},
    }


# ---------------------------------------------------------------------------
# 2. Hypertension risk — PTT -> BP estimate, staged per AHA/ACC
# ---------------------------------------------------------------------------
def estimate_bp_from_ptt(ptt_ms: float, hr: float) -> Dict[str, float]:
    """
    Simplified PTT-to-BP mapping. Pulse Transit Time is inversely related
    to arterial stiffness/pressure; this is a coarse linear approximation
    for screening purposes only (not a calibrated medical PTT model —
    real deployments require per-subject calibration).
    """
    # Illustrative linear coefficients; shorter PTT -> higher pressure.
    systolic = max(80.0, min(200.0, 220.0 - 0.55 * ptt_ms + 0.1 * (hr - 70)))
    diastolic = max(50.0, min(130.0, systolic - 40 + 0.05 * (hr - 70)))
    return {"systolic": round(systolic, 0), "diastolic": round(diastolic, 0)}


def score_bp(systolic: Optional[float], diastolic: Optional[float],
             ptt_ms: Optional[float] = None, heart_rate: Optional[float] = None) -> Dict[str, Any]:
    """AHA/ACC 2017 BP staging: Normal / Elevated / Stage 1 / Stage 2 / Crisis."""
    source = "direct"
    if (systolic is None or diastolic is None) and ptt_ms:
        if not heart_rate:
            return {
                "available": False,
                "score": None,
                "band": None,
                "label": "Insufficient BP data",
                "detail": "PTT was provided but heart_rate is required to estimate BP.",
            }
        est = estimate_bp_from_ptt(ptt_ms, heart_rate)
        systolic, diastolic = est["systolic"], est["diastolic"]
        source = "ptt_estimated"

    if systolic is None or diastolic is None:
        return {
            "available": False,
            "score": None,
            "band": None,
            "label": "Insufficient BP data",
            "detail": "Provide systolic/diastolic directly, or ptt_ms + heart_rate.",
        }

    if systolic >= 180 or diastolic >= 120:
        band, label = "critical", "Hypertensive Crisis — seek care immediately"
    elif systolic >= 140 or diastolic >= 90:
        band, label = "high", "Stage 2 Hypertension"
    elif systolic >= 130 or diastolic >= 80:
        band, label = "moderate", "Stage 1 Hypertension"
    elif systolic >= 120:
        band, label = "elevated", "Elevated Blood Pressure"
    else:
        band, label = "normal", "Normal Blood Pressure"

    return {
        "available": True,
        "score": systolic,
        "band": band,
        "label": label,
        "detail": f"{int(systolic)}/{int(diastolic)} mmHg (source: {source}), staged per AHA/ACC 2017",
        "metrics": {"systolic": systolic, "diastolic": diastolic, "source": source},
    }


# ---------------------------------------------------------------------------
# 3. Physiological Deterioration — adapted NEWS2 / EWS
# ---------------------------------------------------------------------------
def _news2_subscore(value: Optional[float], bands) -> int:
    """bands: list of (lo, hi, points), first match wins; None value -> 0."""
    if value is None:
        return 0
    for lo, hi, points in bands:
        if (lo is None or value >= lo) and (hi is None or value < hi):
            return points
    return 0


def score_news2(heart_rate: Optional[float], spo2: Optional[float],
                 respiratory_rate: Optional[float], temperature: Optional[float],
                 systolic: Optional[float], consciousness: str = "alert") -> Dict[str, Any]:
    """
    Adapted NEWS2 (Royal College of Physicians) early warning score.
    Each vital contributes 0-3 points; total score maps to a risk band
    used in hospitals to flag deteriorating patients early. Adapted here
    for wearable/home input (some inputs like real RR are often absent
    from PPG-only wearables, and are scored 0 when missing rather than
    guessed).
    """
    hr_score = _news2_subscore(heart_rate, [
        (None, 40, 3), (40, 51, 1), (51, 91, 0), (91, 111, 1), (111, 131, 2), (131, None, 3),
    ])
    spo2_score = _news2_subscore(spo2, [
        (None, 92, 3), (92, 94, 2), (94, 96, 1), (96, None, 0),
    ])
    rr_score = _news2_subscore(respiratory_rate, [
        (None, 9, 3), (9, 12, 1), (12, 21, 0), (21, 25, 2), (25, None, 3),
    ])
    temp_score = _news2_subscore(temperature, [
        (None, 35.1, 3), (35.1, 36.1, 1), (36.1, 38.1, 0), (38.1, 39.1, 1), (39.1, None, 2),
    ])
    sys_score = _news2_subscore(systolic, [
        (None, 91, 3), (91, 101, 2), (101, 111, 1), (111, 220, 0), (220, None, 3),
    ])
    consciousness_score = 0 if consciousness == "alert" else 3

    total = hr_score + spo2_score + rr_score + temp_score + sys_score + consciousness_score
    any_single_high = 3 in (hr_score, spo2_score, rr_score, temp_score, sys_score, consciousness_score)

    if total >= 7 or any_single_high and total >= 5:
        band, label = "critical", "High risk — urgent clinical review indicated"
    elif total >= 5:
        band, label = "high", "Medium risk — increased monitoring indicated"
    elif total >= 1:
        band, label = "moderate", "Low-medium risk"
    else:
        band, label = "normal", "Low risk"

    return {
        "available": True,
        "score": total,
        "band": band,
        "label": label,
        "detail": f"Adapted NEWS2 total = {total} "
                  f"(HR:{hr_score} SpO2:{spo2_score} RR:{rr_score} Temp:{temp_score} "
                  f"SBP:{sys_score} Conscious:{consciousness_score})",
        "metrics": {
            "total": total, "hr_points": hr_score, "spo2_points": spo2_score,
            "rr_points": rr_score, "temp_points": temp_score, "sbp_points": sys_score,
            "consciousness_points": consciousness_score,
        },
    }


# ---------------------------------------------------------------------------
# 4. Stress — Electrodermal Activity (EDA) index
# ---------------------------------------------------------------------------
def score_stress(eda_microsiemens: Optional[float], baseline_eda: float = 2.0) -> Dict[str, Any]:
    """
    Tonic EDA (skin conductance level) rises with sympathetic arousal.
    We index the current reading against a resting baseline; larger
    positive deviation -> higher stress band. This is a screening
    heuristic, not a validated clinical stress diagnostic.
    """
    if eda_microsiemens is None:
        return {
            "available": False,
            "score": None,
            "band": None,
            "label": "Insufficient EDA data",
            "detail": "No EDA/GSR reading provided.",
        }

    ratio = eda_microsiemens / baseline_eda if baseline_eda else 1.0

    if ratio >= 2.0:
        band, label = "high", "High stress indication"
    elif ratio >= 1.4:
        band, label = "moderate", "Elevated stress indication"
    else:
        band, label = "normal", "Baseline / relaxed"

    return {
        "available": True,
        "score": round(eda_microsiemens, 2),
        "band": band,
        "label": label,
        "detail": f"EDA={eda_microsiemens:.2f} µS vs baseline {baseline_eda:.2f} µS "
                  f"({ratio:.2f}x baseline)",
        "metrics": {"eda_microsiemens": eda_microsiemens, "baseline_eda": baseline_eda, "ratio": round(ratio, 2)},
    }


# ---------------------------------------------------------------------------
# Composite entry point
# ---------------------------------------------------------------------------
_BAND_RANK = {"normal": 0, "elevated": 1, "moderate": 2, "high": 3, "critical": 4}


def run_scoring_engine(payload: Dict[str, Any], profile=None) -> Dict[str, Any]:
    """
    payload keys (all optional except heart_rate & spo2):
      heart_rate, spo2, temperature, systolic, diastolic, ptt_ms,
      rr_intervals_ms (list), eda_microsiemens, respiratory_rate, consciousness
    `profile` is an optional models.Profile used for personalized EDA baseline.
    """
    heart_rate = payload.get("heart_rate")
    spo2 = payload.get("spo2")
    temperature = payload.get("temperature")
    systolic = payload.get("systolic")
    diastolic = payload.get("diastolic")
    ptt_ms = payload.get("ptt_ms")
    rr_intervals = payload.get("rr_intervals_ms")
    eda = payload.get("eda_microsiemens")
    resp_rate = payload.get("respiratory_rate")
    consciousness = payload.get("consciousness", "alert")

    baseline_eda = 2.0
    if profile is not None and getattr(profile, "baseline_hr", None):
        pass  # placeholder if a per-profile EDA baseline column is added later

    modules = {
        "heartDisease": score_hrv(rr_intervals, heart_rate),
        "hypertension": score_bp(systolic, diastolic, ptt_ms, heart_rate),
        "deterioration": score_news2(heart_rate, spo2, resp_rate, temperature, systolic, consciousness),
        "stress": score_stress(eda, baseline_eda),
    }

    available_bands = [m["band"] for m in modules.values() if m["available"] and m["band"]]
    if available_bands:
        worst = max(available_bands, key=lambda b: _BAND_RANK.get(b, 0))
    else:
        worst = None

    return {
        "modules": modules,
        "overallBand": worst,
        "disclaimer": (
            "Pulsewatch is a risk-screening tool grounded in clinical scoring "
            "frameworks (HRV, AHA/ACC BP staging, NEWS2, EDA stress indexing). "
            "It is not a diagnostic device and does not replace clinical evaluation."
        ),
    }
