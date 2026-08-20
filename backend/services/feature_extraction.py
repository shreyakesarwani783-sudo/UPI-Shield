import re
import tldextract
from urllib.parse import urlparse

def extract_features(url: str) -> dict:
    features = {}

    # --- Basic URL features ---
    features["url_length"] = len(url)
    features["has_https"] = 1 if url.startswith("https://") else 0

    # --- Parse URL ---
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or ""
    except Exception:
        hostname = ""

    # --- Suspicious characters in URL ---
    features["has_at_symbol"]    = 1 if "@" in url else 0
    features["has_ip_address"]   = 1 if re.match(r"http[s]?://\d+\.\d+\.\d+\.\d+", url) else 0
    features["double_slash"]     = 1 if url.count("//") > 1 else 0
    features["has_hex_encoding"] = 1 if "%" in url else 0

    # --- Domain features ---
    ext = tldextract.extract(url)
    features["subdomain_count"]  = len(ext.subdomain.split(".")) if ext.subdomain else 0
    features["domain"]           = ext.domain
    features["suffix"]           = ext.suffix
    features["full_domain"]      = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain

    # --- Dash count in domain ---
    features["dash_count"] = hostname.count("-")

    # --- URL path features ---
    path = parsed.path if parsed.path else ""
    features["path_length"]       = len(path)
    features["path_depth"]        = path.count("/")
    features["has_suspicious_words"] = 1 if any(
        word in url.lower() for word in [
            "login", "signin", "verify", "secure", "account",
            "update", "banking", "payment", "upi", "pin",
            "otp", "kyc", "confirm", "wallet"
        ]
    ) else 0

    return features