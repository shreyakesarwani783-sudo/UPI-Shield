from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ReportRequest(BaseModel):
    url: str
    reason: str | None = None

@router.post("/report")
def report_url(request: ReportRequest):
    # Phase 4 — just acknowledge, storage Phase 5 mein
    print(f"[REPORT] URL reported: {request.url}")
    return {"message": "Report received. Thank you!", "url": request.url}