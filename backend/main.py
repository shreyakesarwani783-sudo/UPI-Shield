from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1 import scan, report, stats, admin
from services.ml_service import load_model
from services.history_service import init_db

app = FastAPI(
    title="UPI Shield API",
    description="Backend for UPI/Phishing Fraud Detection Extension",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model + init database on startup
@app.on_event("startup")
async def startup_event():
    load_model()
    init_db()

app.include_router(scan.router, prefix="/api/v1")
app.include_router(report.router, prefix="/api/v1")
app.include_router(stats.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "UPI Shield API is running!"}