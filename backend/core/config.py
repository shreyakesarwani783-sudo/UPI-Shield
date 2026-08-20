import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SAFE_BROWSING_API_KEY = os.getenv("SAFE_BROWSING_API_KEY", "")