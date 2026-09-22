from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    relationship: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    priority: Optional[str] = "medium"


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    relationship: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    priority: Optional[str] = None


class ContactResponse(BaseModel):
    id: int
    user_id: int
    name: str
    relationship: str
    phone: str
    email: Optional[str] = None
    priority: str
    created_at: datetime

    class Config:
        from_attributes = True
