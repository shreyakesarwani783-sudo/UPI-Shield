from fastapi import APIRouter
from pydantic import BaseModel
from services.history_service import save_report

router = APIRouter()

class ReportRequest(BaseModel):
    url: str
    reason: str | None = None

@router.post("/report")
def report_url(request: ReportRequest):
    save_report(url=request.url, reason=request.reason)
    return {"message": "Report received. Thank you!", "url": request.url}