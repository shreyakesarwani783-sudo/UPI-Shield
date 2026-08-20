from fastapi import APIRouter
from services.history_service import get_stats, get_recent_flagged, get_recent_reports

router = APIRouter()

@router.get("/stats")
def stats_endpoint():
    live = get_stats()
    return {
        **live,
        "accuracy": 85.39,
        "model": "Random Forest",
        "dataset_size": 549346
    }

@router.get("/flagged")
def flagged_endpoint():
    return get_recent_flagged()

@router.get("/reports")
def reports_endpoint():
    return get_recent_reports()