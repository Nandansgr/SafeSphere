import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database.config import engine, Base
from app.api.auth import router as auth_router
from app.api.contacts import router as contacts_router
from app.api.sos import router as sos_router
from app.api.incidents import router as incidents_router
from app.api.profile import router as profile_router
from app.api.dashboard import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Safety Alert & Smart Protection System",
    description="Emergency alert and incident reporting API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router, prefix="/api", tags=["Authentication"])
app.include_router(contacts_router, prefix="/api", tags=["Emergency Contacts"])
app.include_router(sos_router, prefix="/api", tags=["SOS Alert"])
app.include_router(incidents_router, prefix="/api", tags=["Incident Reports"])
app.include_router(profile_router, prefix="/api", tags=["Profile"])
app.include_router(dashboard_router, prefix="/api", tags=["Dashboard"])


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "Safety Alert API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
