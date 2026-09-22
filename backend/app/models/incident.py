from sqlalchemy import Column, Integer, String, Text, Enum, TIMESTAMP, Numeric, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.config import Base


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    incident_id = Column(String(50), unique=True, nullable=False, index=True)
    incident_type = Column(Enum("theft", "assault", "accident", "fire", "harassment", "vandalism", "medical", "other"), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(500), nullable=False)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    severity = Column(Enum("low", "medium", "high", "critical"), default="medium")
    image = Column(String(500), nullable=True)
    status = Column(Enum("pending", "investigating", "resolved", "closed"), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="incidents")
