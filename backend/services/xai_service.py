from google import genai
from core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)

def get_explanation(url: str, reasons: list[str], risk_level: str) -> str | None:
    if risk_level in ["Safe"]:
        return None

    if not GEMINI_API_KEY:
        return None

    try:
        reasons_text = "\n".join(f"- {r}" for r in reasons)

        prompt = f"""You are a cybersecurity assistant helping non-technical Indian users stay safe from UPI and banking fraud.

A website has been flagged as potentially dangerous. Explain in exactly 2 simple sentences why this site might be a phishing or fraud attempt. Use simple, clear language that anyone can understand. Do not use technical jargon.

URL: {url}
Risk Level: {risk_level}
Red flags detected:
{reasons_text}

Response must be exactly 2 sentences. Be direct and helpful."""

        response = client.models.generate_content(
            model="gemini-3.6-flash",  # 2.0 se 3.6 karo
            contents=prompt
        )
        return response.text.strip()

    except Exception as e:
        print(f"[Gemini] Error: {e}")
        return None