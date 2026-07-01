from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SupportTicketCreate(BaseModel):
    subject: str
    message: Optional[str] = None
    category: Optional[str] = None
    priority: str = "Medium"


class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    admin_reply: Optional[str] = None


class SupportTicketOut(BaseModel):
    id: str
    user_id: str
    subject: str
    message: Optional[str] = None
    category: Optional[str] = None
    priority: str
    status: str
    admin_reply: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuthLoginRequest(BaseModel):
    email: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    name: str
    email: str


class RefreshRequest(BaseModel):
    refresh_token: str
