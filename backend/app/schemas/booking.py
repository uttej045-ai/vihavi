from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BookingCreate(BaseModel):
    event_id: str
    ticket_id: Optional[str] = None
    quantity: int = 1
    coupon_code: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    check_in_status: Optional[str] = None
    checked_in_at: Optional[datetime] = None


class BookingOut(BaseModel):
    id: str
    event_id: str
    ticket_id: Optional[str] = None
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    ticket_name: Optional[str] = None
    ticket_price: float = 0.0
    event_name: Optional[str] = None
    quantity: int
    total_paid: float
    discount: float = 0.0
    coupon_code: Optional[str] = None
    status: str
    check_in_status: str
    checked_in_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
