from fastapi import APIRouter
from services.history_service import get_stats, get_recent_flagged, get_recent_reports

router = APIRouter()

MODEL_META = {
    "accuracy": 94.18,
    "precision": 92.45,
    "recall": 92.83,
    "f1": 92.64,
    "model": "Random Forest",
    "dataset_size": 707514,
    "train_split": 566011,
    "test_split": 141503,
    "features": "28 URL-based features",
    "trees": "200 estimators",
    "max_depth": "None (unrestricted)",
    "tp": 51844,
    "tn": 81421,
    "fp": 4234,
    "fn": 4004,
}

@router.get("/stats")
def stats_endpoint():
    live = get_stats()
    return {**live, **MODEL_META}

@router.get("/flagged")
def flagged_endpoint():
    return get_recent_flagged()

@router.get("/reports")
def reports_endpoint():
    return get_recent_reports()