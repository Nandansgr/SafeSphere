from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class SOSCreate(BaseModel):
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    address: Optional[str] = None
    message: Optional[str] = "Emergency SOS Alert!"
    alert_type: Optional[str] = "manual"


class SOSResponse(BaseModel):
    id: int
    user_id: int
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    address: Optional[str] = None
    message: Optional[str] = None
    alert_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class SOSHistoryResponse(BaseModel):
    alerts: list[SOSResponse]
    total: int
    page: int
    per_page: int
    pages: int
