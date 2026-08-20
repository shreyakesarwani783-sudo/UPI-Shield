import whois
from datetime import datetime

def get_domain_age_days(domain: str) -> int:
    """Returns domain age in days. Returns -1 if lookup fails."""
    try:
        w = whois.whois(domain)
        creation_date = w.creation_date

        # Sometimes it's a list
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date is None:
            return -1

        age = (datetime.now() - creation_date).days
        return age

    except Exception:
        return -1  # WHOIS failed — treat as unknown