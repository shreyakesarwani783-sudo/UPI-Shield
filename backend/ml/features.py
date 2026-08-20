import re
import tldextract
from urllib.parse import urlparse

def extract_features_from_url(url: str) -> dict:
    # URL mein https:// nahi hai dataset mein — handle karo
    if not url.startswith("http"):
        url = "http://" + url

    features = {}

    features["url_length"] = len(url)
    features["has_https"] = 1 if url.startswith("https://") else 0

    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or ""
    except Exception:
        hostname = ""

    features["has_at_symbol"]    = 1 if "@" in url else 0
    features["has_ip_address"]   = 1 if re.match(r"http[s]?://\d+\.\d+\.\d+\.\d+", url) else 0
    features["double_slash"]     = 1 if url.count("//") > 1 else 0
    features["has_hex_encoding"] = 1 if "%" in url else 0
    features["dash_count"]       = hostname.count("-")
    features["dot_count"]        = url.count(".")
    features["has_suspicious_words"] = 1 if any(
        word in url.lower() for word in [
            "login", "signin", "verify", "secure", "account",
            "update", "banking", "payment", "upi", "pin",
            "otp", "kyc", "confirm", "wallet", "paypal",
            "ebay", "amazon", "apple", "microsoft"
        ]
    ) else 0

    ext = tldextract.extract(url)
    features["subdomain_count"] = len(ext.subdomain.split(".")) if ext.subdomain else 0

    path = parsed.path if parsed.path else ""
    features["path_length"] = len(path)
    features["path_depth"]  = path.count("/")

    try:
        query = parsed.query or ""
        features["query_length"] = len(query)
    except Exception:
        features["query_length"] = 0

    return features

def get_feature_names():
    return [
        "url_length", "has_https", "has_at_symbol", "has_ip_address",
        "double_slash", "has_hex_encoding", "dash_count", "dot_count",
        "has_suspicious_words", "subdomain_count", "path_length",
        "path_depth", "query_length"
    ]