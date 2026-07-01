from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class EventBase(BaseModel):
    name: str
    summary: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    format: Optional[str] = None
    age_restriction: Optional[str] = None

    # Location
    venue: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip: Optional[str] = None
    maps_link: Optional[str] = None
    map_pin: Optional[str] = None
    is_online: bool = False
    virtual_link: Optional[str] = None
    virtual_platform: Optional[str] = None
    access_instructions: Optional[str] = None

    # Schedule
    is_multi_day: bool = False
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    time_zone: Optional[str] = None
    registration_deadline: Optional[str] = None
    publish_date: Optional[str] = None

    # Media
    banner: Optional[str] = None
    logo: Optional[str] = None
    background: Optional[str] = None
    gallery: Optional[List[Any]] = []
    video: Optional[str] = None
    qr_placement: Optional[str] = None

    # Policies
    terms: Optional[str] = None
    refund_policy: Optional[str] = None
    instructions: Optional[str] = None
    what_to_bring: Optional[str] = None
    cancellation_policy: Optional[str] = None
    cancellation_details: Optional[str] = None

    # Settings
    visibility: str = "Public"
    is_private: bool = False
    is_invite_only: bool = False
    guest_list: Optional[List[str]] = []
    require_approval: bool = False
    attendee_list_visibility: str = "Hidden"
    enable_waitlist: bool = False
    notify_waitlist: bool = False
    is_free: bool = False
    is_sold_out: bool = False
    booking_limit: int = 10
    questions: Optional[List[Any]] = []
    agenda: Optional[List[Any]] = []
    faqs: Optional[List[Any]] = []

    # Contact
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    social_twitter: Optional[str] = None
    social_linkedin: Optional[str] = None
    social_instagram: Optional[str] = None

    # Organizer info
    organizer_name: Optional[str] = None
    organizer_email: Optional[str] = None

    # Misc
    agree_to_terms: bool = False
    featured: bool = False
    price: Optional[float] = None


class EventCreate(EventBase):
    tickets: Optional[List[Any]] = []  # ticket data submitted together with event
    coupons: Optional[List[Any]] = []


class EventUpdate(BaseModel):
    """All fields optional for PATCH."""
    name: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    banner: Optional[str] = None
    visibility: Optional[str] = None
    featured: Optional[bool] = None
    is_sold_out: Optional[bool] = None
    enable_waitlist: Optional[bool] = None
    agree_to_terms: Optional[bool] = None

    class Config:
        extra = "allow"  # allow any other field to be patched


class EventOut(EventBase):
    id: str
    status: str
    organizer_id: Optional[str] = None
    rating: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
