import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    message = Column(String, nullable=True)
    category = Column(String, nullable=True)  # Payment, Auth, Refund, Content, Tickets
    priority = Column(
        Enum("Low", "Medium", "High", "Critical", name="ticket_priority"),
        default="Medium",
    )
    status = Column(
        Enum("Open", "In Progress", "Resolved", "Closed", name="ticket_status"),
        default="Open",
    )
    admin_reply = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="support_tickets")
