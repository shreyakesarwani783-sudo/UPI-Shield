import re
import math
import tldextract
from urllib.parse import urlparse
from collections import Counter

SUSPICIOUS_TLDS = {"tk", "ml", "ga", "cf", "gq", "xyz", "top", "club", "work", "support", "click", "loan", "win"}
SHORTENER_DOMAINS = {"bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly", "shorte.st", "adf.ly"}
BRAND_KEYWORDS = ["paytm", "phonepe", "googlepay", "sbi", "hdfc", "icici", "axis", "upi", "amazon", "flipkart", "paypal", "netflix", "microsoft", "apple", "facebook", "instagram"]

def shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    counts = Counter(s)
    length = len(s)
    return -sum((c / length) * math.log2(c / length) for c in counts.values())

def extract_features_from_url(url: str) -> dict:
    if not url.startswith("http"):
        url = "http://" + url

    features = {}
    features["url_length"] = len(url)
    features["has_https"] = 1 if url.startswith("https://") else 0

    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or ""
    except Exception:
        parsed = None
        hostname = ""

    features["has_at_symbol"]    = 1 if "@" in url else 0
    features["has_ip_address"]   = 1 if re.match(r"http[s]?://\d+\.\d+\.\d+\.\d+", url) else 0
    features["double_slash"]     = 1 if url.count("//") > 1 else 0
    features["has_hex_encoding"] = 1 if "%" in url else 0
    features["dash_count"]       = hostname.count("-")
    features["dot_count"]        = url.count(".")

    suspicious_words = [
        "login", "signin", "verify", "secure", "account",
        "update", "banking", "payment", "upi", "pin",
        "otp", "kyc", "confirm", "wallet", "paypal",
        "ebay", "amazon", "apple", "microsoft"
    ]
    url_lower = url.lower()
    features["has_suspicious_words"] = 1 if any(w in url_lower for w in suspicious_words) else 0
    features["suspicious_word_count"] = sum(1 for w in suspicious_words if w in url_lower)

    ext = tldextract.extract(url)
    features["subdomain_count"] = len(ext.subdomain.split(".")) if ext.subdomain else 0

    path = parsed.path if parsed and parsed.path else ""
    features["path_length"] = len(path)
    features["path_depth"]  = path.count("/")

    try:
        query = parsed.query or ""
        features["query_length"] = len(query)
    except Exception:
        features["query_length"] = 0

    # ===== NEW FEATURES =====

    # Hostname structural stats
    features["hostname_length"] = len(hostname)

    digits_in_url = sum(c.isdigit() for c in url)
    features["digit_count"] = digits_in_url
    features["digit_ratio"] = round(digits_in_url / len(url), 4) if len(url) > 0 else 0

    special_chars = sum(1 for c in url if c in "!@#$%^&*()_+-=[]{}|;:,.<>?~`")
    features["special_char_ratio"] = round(special_chars / len(url), 4) if len(url) > 0 else 0

    # Entropy — randomness of hostname (phishing domains often look "random")
    features["hostname_entropy"] = round(shannon_entropy(hostname), 3)

    # Vowel ratio in domain (legit brand names have natural vowel patterns)
    domain_letters = [c for c in ext.domain.lower() if c.isalpha()] if ext.domain else []
    vowels = sum(1 for c in domain_letters if c in "aeiou")
    features["vowel_ratio"] = round(vowels / len(domain_letters), 3) if domain_letters else 0

    # TLD risk
    tld = ext.suffix.split(".")[-1] if ext.suffix else ""
    features["suspicious_tld"] = 1 if tld in SUSPICIOUS_TLDS else 0
    features["tld_length"] = len(tld)

    # URL shortener
    full_domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain
    features["is_shortener"] = 1 if full_domain in SHORTENER_DOMAINS else 0

    # Brand impersonation: brand name appears in subdomain/path but NOT as the actual registered domain
    brand_in_subpath = 0
    for brand in BRAND_KEYWORDS:
        if brand in (ext.subdomain or "").lower() or brand in path.lower():
            if brand != (ext.domain or "").lower():
                brand_in_subpath = 1
                break
    features["brand_impersonation"] = brand_in_subpath

    # Port presence
    features["has_port"] = 1 if (parsed and parsed.port) else 0

    # www prefix
    features["has_www"] = 1 if hostname.startswith("www.") else 0

    # Longest alphanumeric "word" in hostname (long random strings are suspicious)
    words = re.split(r"[.\-]", hostname)
    features["longest_word_length"] = max((len(w) for w in words), default=0)

    # Hyphen ratio in hostname
    features["hyphen_ratio"] = round(hostname.count("-") / len(hostname), 3) if hostname else 0

    return features

def get_feature_names():
    return [
        "url_length", "has_https", "has_at_symbol", "has_ip_address",
        "double_slash", "has_hex_encoding", "dash_count", "dot_count",
        "has_suspicious_words", "suspicious_word_count", "subdomain_count",
        "path_length", "path_depth", "query_length",
        "hostname_length", "digit_count", "digit_ratio", "special_char_ratio",
        "hostname_entropy", "vowel_ratio", "suspicious_tld", "tld_length",
        "is_shortener", "brand_impersonation", "has_port", "has_www",
        "longest_word_length", "hyphen_ratio"
    ]