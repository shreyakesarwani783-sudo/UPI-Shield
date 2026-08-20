from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
def get_stats():
    return {
        "total_scans": 120,
        "flagged": 35,
        "safe": 85,
        "reports": 12,
        "accuracy": 85.39,
        "model": "Random Forest",
        "dataset_size": 549346
    }