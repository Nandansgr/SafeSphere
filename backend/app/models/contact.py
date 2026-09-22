from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship as orm_relationship
from app.database.config import Base


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    rel_type = Column("relationship", String(100), nullable=False)
    phone = Column(String(10), nullable=False)
    email = Column(String(255), nullable=True)
    priority = Column(Enum("low", "medium", "high", "critical"), default="medium")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = orm_relationship("User", back_populates="contacts")

    @property
    def relationship(self):
        return self.rel_type

    @relationship.setter
    def relationship(self, value):
        self.rel_type = value
