from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: Optional[str] = None
    type: str = "info"
    message: str


class NotificationUpdate(BaseModel):
    read: Optional[bool] = None


class NotificationOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    type: str
    message: str
    read: bool
    timestamp: datetime

    class Config:
        from_attributes = True
