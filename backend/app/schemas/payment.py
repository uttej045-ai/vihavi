from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentCreate(BaseModel):
    booking_id: str
    amount: float
    method: str = "Razorpay"
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None


class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    gateway_payment_id: Optional[str] = None


class PaymentOut(BaseModel):
    id: str
    booking_id: str
    amount: float
    method: str
    status: str
    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
