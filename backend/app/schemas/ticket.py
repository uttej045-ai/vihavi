from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TicketBase(BaseModel):
    event_id: str
    name: str
    desc: Optional[str] = None
    price: float = 0.0
    quantity: int = 100
    sale_start: Optional[str] = None
    sale_end: Optional[str] = None
    min_limit: int = 1
    max_limit: int = 10
    benefits: Optional[str] = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    name: Optional[str] = None
    desc: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    sale_start: Optional[str] = None
    sale_end: Optional[str] = None
    min_limit: Optional[int] = None
    max_limit: Optional[int] = None
    benefits: Optional[str] = None
    sold: Optional[int] = None


class TicketOut(TicketBase):
    id: str
    sold: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
