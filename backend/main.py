from fastapi import FastAPI
from sqlalchemy import text
from routers.leads import router as leads_router
from database.connection import engine
from models import (
    User,
    Lead,
    LeadNote,
    Project,
    Building,
    Unit,
    Booking
)
from routers.dashboard import router as dashboard_router
from routers.bookings import router as bookings_router
from routers.auth import router as auth_router
from routers.properties import router as properties_router

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="Real Estate CRM API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://real-estate-crm-frontend-km0d.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(leads_router)
app.include_router(properties_router)
app.include_router(bookings_router)
app.include_router(dashboard_router)
@app.get("/")
def root():
    return {
        "message": "Real Estate CRM API is running"
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }