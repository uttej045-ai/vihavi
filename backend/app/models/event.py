import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Float,
    ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    summary = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    format = Column(String, nullable=True)  # In-Person / Online / Hybrid
    age_restriction = Column(String, nullable=True)

    # Location
    venue = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    zip = Column(String, nullable=True)
    maps_link = Column(String, nullable=True)
    map_pin = Column(String, nullable=True)
    is_online = Column(Boolean, default=False)
    virtual_link = Column(String, nullable=True)
    virtual_platform = Column(String, nullable=True)
    access_instructions = Column(Text, nullable=True)

    # Schedule
    is_multi_day = Column(Boolean, default=False)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    start_time = Column(String, nullable=True)
    end_time = Column(String, nullable=True)
    time_zone = Column(String, nullable=True)
    registration_deadline = Column(String, nullable=True)
    publish_date = Column(String, nullable=True)

    # Media
    banner = Column(String, nullable=True)
    logo = Column(String, nullable=True)
    background = Column(String, nullable=True)
    gallery = Column(JSON, default=list)
    video = Column(String, nullable=True)
    qr_placement = Column(String, nullable=True)

    # Policies
    terms = Column(Text, nullable=True)
    refund_policy = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    what_to_bring = Column(Text, nullable=True)
    cancellation_policy = Column(String, nullable=True)
    cancellation_details = Column(Text, nullable=True)

    # Settings
    visibility = Column(String, default="Public")
    is_private = Column(Boolean, default=False)
    is_invite_only = Column(Boolean, default=False)
    guest_list = Column(JSON, default=list)
    require_approval = Column(Boolean, default=False)
    attendee_list_visibility = Column(String, default="Hidden")
    enable_waitlist = Column(Boolean, default=False)
    notify_waitlist = Column(Boolean, default=False)
    is_free = Column(Boolean, default=False)
    is_sold_out = Column(Boolean, default=False)
    booking_limit = Column(Integer, default=10)
    questions = Column(JSON, default=list)
    agenda = Column(JSON, default=list)
    faqs = Column(JSON, default=list)

    # Contact
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    social_twitter = Column(String, nullable=True)
    social_linkedin = Column(String, nullable=True)
    social_instagram = Column(String, nullable=True)

    # Organizer info (denormalized for display)
    organizer_name = Column(String, nullable=True)
    organizer_email = Column(String, nullable=True)

    # Status
    status = Column(
        Enum("Draft", "Pending", "Published", "Rejected", "Cancelled", "Completed", name="event_status"),
        default="Draft",
    )
    agree_to_terms = Column(Boolean, default=False)
    featured = Column(Boolean, default=False)
    price = Column(Float, nullable=True)  # minimum ticket price for display
    rating = Column(Float, nullable=True)

    # FK
    organizer_id = Column(String, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    organizer = relationship("User", back_populates="events", foreign_keys=[organizer_id])
    tickets = relationship("Ticket", back_populates="event", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="event")
    coupons = relationship("Coupon", back_populates="event", cascade="all, delete-orphan")
    attendees = relationship("Attendee", back_populates="event")
    wishlist_items = relationship("Wishlist", back_populates="event")
