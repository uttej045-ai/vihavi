import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    name = Column(String, nullable=False)
    desc = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    quantity = Column(Integer, default=100)
    sold = Column(Integer, default=0)
    sale_start = Column(String, nullable=True)
    sale_end = Column(String, nullable=True)
    min_limit = Column(Integer, default=1)
    max_limit = Column(Integer, default=10)
    benefits = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    event = relationship("Event", back_populates="tickets")
    bookings = relationship("Booking", back_populates="ticket")
