from services.heuristic_service import heuristic_score
from services.whois_service import get_domain_age_days
from services.feature_extraction import extract_features
from services.ml_service import predict

def get_risk_level(score: int) -> str:
    if score <= 15:  return "Safe"
    if score <= 40:  return "Caution"
    if score <= 65:  return "Warning"
    return "Critical"

def compute_risk(url: str) -> dict:
    reasons = []

    # Step 1: Heuristic score
    heuristic = heuristic_score(url)
    h_score = heuristic["score"]
    reasons.extend(heuristic["reasons"])

    # Step 2: Trusted domain → Safe return
    if heuristic["is_trusted"]:
        return {
            "risk_score": 0,
            "level": "Safe",
            "reasons": ["Verified trusted domain — no further checks needed"],
            "confidence": 0.99
        }

    # Step 3: ML score
    ml_result = predict(url)
    ml_score = ml_result["ml_score"]

    if ml_result["ml_available"]:
        if ml_score >= 70:
            reasons.append(f"ML model flagged as phishing (confidence: {ml_result['ml_confidence']})")
        elif ml_score >= 40:
            reasons.append(f"ML model: borderline suspicious (score: {ml_score}/100)")
    else:
        reasons.append("ML model unavailable — heuristics only")

    # Step 4: Domain age
    features = extract_features(url)
    full_domain = features.get("full_domain", "")
    age_days = get_domain_age_days(full_domain)

    if age_days != -1 and age_days < 30:
        reasons.append(f"Very new domain — only {age_days} days old!")
    elif age_days != -1 and age_days < 180:
        reasons.append(f"Relatively new domain — {age_days} days old")

    # Step 5: Fuse scores
    if ml_result["ml_available"]:
        if any("typosquat" in r.lower() for r in reasons):
            final_score = h_score  # typosquat pe heuristic dominant
        else:
            final_score = int(0.6 * ml_score + 0.4 * h_score)
    else:
        final_score = h_score

    final_score = min(final_score, 100)                   
    level = get_risk_level(final_score)

    return {
        "risk_score": final_score,
        "level": level,
        "reasons": reasons,
        "confidence": round(min(0.5 + final_score / 200, 0.95), 2)
    }