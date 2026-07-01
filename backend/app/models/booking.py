import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Denormalized for fast display
    user_name = Column(String, nullable=True)
    user_email = Column(String, nullable=True)
    user_phone = Column(String, nullable=True)
    ticket_name = Column(String, nullable=True)
    ticket_price = Column(Float, default=0.0)
    event_name = Column(String, nullable=True)

    quantity = Column(Integer, default=1)
    total_paid = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    coupon_code = Column(String, nullable=True)

    status = Column(
        Enum("Pending", "Confirmed", "Cancelled", "Refunded", name="booking_status"),
        default="Pending",
    )
    check_in_status = Column(
        Enum("Pending", "Checked In", name="checkin_status"),
        default="Pending",
    )
    checked_in_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings")
    event = relationship("Event", back_populates="bookings")
    ticket = relationship("Ticket", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
    attendees = relationship("Attendee", back_populates="booking")
