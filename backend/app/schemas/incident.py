from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class IncidentCreate(BaseModel):
    incident_type: str = Field(..., min_length=1)
    description: str = Field(..., min_length=10)
    location: str = Field(..., min_length=1)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: Optional[str] = "medium"
    image: Optional[str] = None


class IncidentUpdate(BaseModel):
    incident_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None


class IncidentResponse(BaseModel):
    id: int
    user_id: int
    incident_id: str
    incident_type: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: str
    image: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
