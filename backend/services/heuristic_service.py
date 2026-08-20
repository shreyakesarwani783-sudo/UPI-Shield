from services.feature_extraction import extract_features

# Expanded trusted domains list
TRUSTED_DOMAINS = [
    "sbi.co.in", "onlinesbi.sbi", "paytm.com", "phonepe.com",
    "googlepay.com", "npci.org.in", "bhimupi.org.in", "yesbank.in",
    "hdfcbank.com", "icicibank.com", "axisbank.com", "kotak.com",
    "pnbindia.in", "unionbankofindia.co.in", "bankofbaroda.in",
    "canarabank.com", "amazon.in", "flipkart.com", "mobikwik.com",
    "freecharge.in", "airtel.in", "jio.com", "indusind.com",
    "federalbank.co.in", "idfcfirstbank.com", "rblbank.com",
    "google.com", "youtube.com", "gmail.com", "hdfc.bank.in", "icci.bank.in",     
]

def levenshtein(a: str, b: str) -> int:
    matrix = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1): matrix[i][0] = i
    for j in range(len(b) + 1): matrix[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i-1] == b[j-1] else 1
            matrix[i][j] = min(
                matrix[i-1][j] + 1,
                matrix[i][j-1] + 1,
                matrix[i-1][j-1] + cost
            )
    return matrix[len(a)][len(b)]

def heuristic_score(url: str) -> dict:
    features = extract_features(url)
    reasons = []
    score = 0

    full_domain = features.get("full_domain", "")

    # Exact match = safe
    if full_domain in TRUSTED_DOMAINS:
        return {
            "score": 0,
            "reasons": ["Exact match with trusted domain"],
            "is_trusted": True
        }

    # Typosquat check
    closest = min(TRUSTED_DOMAINS, key=lambda d: levenshtein(full_domain, d))
    dist = levenshtein(full_domain, closest)
    if 1 <= dist <= 3:
        score += 75
        reasons.append(f"Looks like '{closest}' (typosquat suspected, distance={dist})")

    # Feature-based scoring
    if not features["has_https"]:
        score += 20
        reasons.append("No HTTPS — insecure connection")

    if features["has_at_symbol"]:
        score += 25
        reasons.append("URL contains '@' — classic phishing trick")

    if features["has_ip_address"]:
        score += 30
        reasons.append("IP address used instead of domain name")

    if features["subdomain_count"] > 2:
        score += 15
        reasons.append(f"Too many subdomains ({features['subdomain_count']})")

    if features["dash_count"] > 2:
        score += 10
        reasons.append(f"Too many dashes in domain ({features['dash_count']})")

    if features["url_length"] > 75:
        score += 10
        reasons.append(f"Unusually long URL ({features['url_length']} chars)")

    if features["has_suspicious_words"]:
        score += 15
        reasons.append("Suspicious keywords found (login/verify/upi/otp etc.)")

    if features["double_slash"]:
        score += 10
        reasons.append("Double slash redirection detected")

    if not reasons:
        reasons.append("No major red flags detected")
        
    # Dash + suspicious TLD check
    if any(tld in features.get("suffix", "") for tld in ["tk", "ml", "ga", "cf", "gq"]):
        score += 20
        reasons.append("Suspicious free TLD detected")

# Force minimum score for typosquat
    if score >= 40:  # already has typosquat
        score = max(score, 75)  # minimum 75 agar typosquat hai
    

    return {
        "score": min(score, 100),
        "reasons": reasons,
        "is_trusted": False
    }