from fastapi import APIRouter
from pydantic import BaseModel
from services.risk_engine import compute_risk
from services.xai_service import get_explanation

router = APIRouter()

class ScanRequest(BaseModel):
    url: str

class ScanResponse(BaseModel):
    url: str
    risk_score: int
    level: str
    reasons: list[str]
    confidence: float
    explanation: str | None = None

@router.post("/scan", response_model=ScanResponse)
def scan_url(request: ScanRequest):
    # Step 1: Risk computation
    result = compute_risk(request.url)

    # Step 2: Gemini explanation (only for Medium+ risk)
    explanation = get_explanation(
        url=request.url,
        reasons=result["reasons"],
        risk_level=result["level"]
    )

    return ScanResponse(
        url=request.url,
        risk_score=result["risk_score"],
        level=result["level"],
        reasons=result["reasons"],
        confidence=result["confidence"],
        explanation=explanation
    )