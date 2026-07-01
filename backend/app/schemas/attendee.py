from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AttendeeCreate(BaseModel):
    booking_id: str
    event_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    qr_code: Optional[str] = None


class AttendeeUpdate(BaseModel):
    checked_in: Optional[bool] = None
    checked_in_at: Optional[datetime] = None


class AttendeeOut(BaseModel):
    id: str
    booking_id: str
    event_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    checked_in: bool
    checked_in_at: Optional[datetime] = None
    qr_code: Optional[str] = None

    class Config:
        from_attributes = True


class WishlistCreate(BaseModel):
    event_id: str


class WishlistOut(BaseModel):
    id: str
    user_id: str
    event_id: str
    created_at: datetime

    class Config:
        from_attributes = True
