from sqlalchemy import Column, Integer, String, Boolean, Enum, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.database.config import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    profile_picture = Column(String(500), nullable=True)
    role = Column(Enum("user", "admin"), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    sos_alerts = relationship("SOSAlert", back_populates="user", cascade="all, delete-orphan")
    incidents = relationship("IncidentReport", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")
