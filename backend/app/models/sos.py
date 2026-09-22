from sqlalchemy import Column, Integer, String, Text, Enum, TIMESTAMP, Numeric, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.config import Base


class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    address = Column(Text, nullable=True)
    message = Column(Text, nullable=True)
    alert_type = Column(Enum("manual", "automatic", "panic", "medical", "fire", "security"), default="manual")
    status = Column(Enum("active", "acknowledged", "resolved", "cancelled"), default="active", index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="sos_alerts")
