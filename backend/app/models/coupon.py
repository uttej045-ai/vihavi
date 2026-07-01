import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_type = Column(String, default="Percentage")  # Percentage | Fixed Amount
    value = Column(Float, nullable=False)
    limit = Column(Integer, nullable=True)           # max uses
    used_count = Column(Integer, default=0)
    valid_from = Column(String, nullable=True)
    valid_until = Column(String, nullable=True)
    applicable_tickets = Column(JSON, default=list)
    active = Column(Boolean, default=True)
    expiry = Column(String, nullable=True)            # legacy field from db.json
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    event = relationship("Event", back_populates="coupons")
