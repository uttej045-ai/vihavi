from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class CouponCreate(BaseModel):
    event_id: Optional[str] = None
    code: str
    discount_type: str = "Percentage"
    value: float
    limit: Optional[int] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    applicable_tickets: Optional[List[Any]] = []
    active: bool = True
    expiry: Optional[str] = None


class CouponUpdate(BaseModel):
    active: Optional[bool] = None
    value: Optional[float] = None
    limit: Optional[int] = None
    valid_until: Optional[str] = None
    expiry: Optional[str] = None


class CouponOut(CouponCreate):
    id: str
    used_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class CouponValidateRequest(BaseModel):
    code: str
    event_id: Optional[str] = None
    ticket_id: Optional[str] = None
    amount: float


class CouponValidateResponse(BaseModel):
    valid: bool
    discount_type: Optional[str] = None
    value: Optional[float] = None
    discount_amount: Optional[float] = None
    final_amount: Optional[float] = None
    message: str
