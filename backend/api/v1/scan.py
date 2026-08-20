from fastapi import APIRouter
from pydantic import BaseModel
from services.risk_engine import compute_risk
from services.xai_service import get_explanation
from services.history_service import save_scan

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

    # Step 3: Save to history
    save_scan(
        url=request.url,
        risk_score=result["risk_score"],
        level=result["level"],
        confidence=result["confidence"],
        reasons=result["reasons"],
        explanation=explanation
    )

    return ScanResponse(
        url=request.url,
        risk_score=result["risk_score"],
        level=result["level"],
        reasons=result["reasons"],
        confidence=result["confidence"],
        explanation=explanation
    )