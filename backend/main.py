import os
import sys
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

# Ensure the current directory is on python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import engine, Base, get_db

# Import all models so SQLAlchemy sees them
import app.models  # noqa: F401
from app.models.user import User
from app.models.event import Event
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.ticket import Ticket
from app.models.attendee import Attendee

# Restructured routers imported from top-level packages
from auth import router as auth_router
from users import router as users_router
from events import router as events_router
from tickets import router as tickets_router
from registrations import router as registrations_router
from checkins import router as checkins_router
from notifications import router as notifications_router
from analytics import router as analytics_router

# Core app routers that remain inside app/routers/
from app.routers import payments, coupons, support_tickets, profiles
from app.dependencies import get_current_user

# ─── Create tables ─────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Vihavi Event Platform — Production API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(events_router)
app.include_router(tickets_router)
app.include_router(registrations_router)
app.include_router(payments.router)
app.include_router(notifications_router)
app.include_router(coupons.router)
app.include_router(checkins_router)
app.include_router(support_tickets.router)
app.include_router(analytics_router)
app.include_router(profiles.router)


# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "online",
        "app": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


# ─── Attendee Dashboard Stats ──────────────────────────────────────────────────
@app.get("/dashboardStats", tags=["attendee-dashboard"])
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Per-user dashboard statistics for the attendee dashboard."""
    total_bookings = db.query(func.count(Booking.id)).filter(
        Booking.user_id == current_user.id
    ).scalar() or 0

    amount_spent = db.query(func.sum(Payment.amount)).join(
        Booking, Payment.booking_id == Booking.id
    ).filter(
        Booking.user_id == current_user.id,
        Payment.status == "Success",
    ).scalar() or 0.0

    wishlist_count = db.query(func.count(Attendee.id)).filter(
        Attendee.email == current_user.email
    ).scalar() or 0

    upcoming_count = db.query(func.count(Booking.id)).filter(
        Booking.user_id == current_user.id,
        Booking.status == "Confirmed",
    ).scalar() or 0

    return [{
        "id": "1",
        "totalBookings": total_bookings,
        "upcomingEvents": upcoming_count,
        "wishlistCount": wishlist_count,
        "amountSpent": round(float(amount_spent), 2),
    }]


# ─── Recent Bookings (attendee) ────────────────────────────────────────────────
@app.get("/recentBookings", tags=["attendee-dashboard"])
def recent_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the 5 most recent bookings for the current attendee."""
    rows = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .limit(5)
        .all()
    )
    return [
        {
            "id": b.id,
            "eventId": b.event_id,
            "eventName": b.event_name,
            "ticketName": b.ticket_name,
            "quantity": b.quantity,
            "totalPaid": b.total_paid,
            "status": b.status,
            "checkInStatus": b.check_in_status,
            "date": b.created_at.isoformat() if b.created_at else None,
        }
        for b in rows
    ]


# ─── Recommended Events ────────────────────────────────────────────────────────
@app.get("/recommendedEvents", tags=["attendee-dashboard"])
def recommended_events(db: Session = Depends(get_db)):
    """Return published events as recommended events for the attendee dashboard."""
    evts = (
        db.query(Event)
        .filter(Event.status == "Published")
        .order_by(Event.created_at.desc())
        .limit(6)
        .all()
    )
    return [
        {
            "id": e.id,
            "name": e.name,
            "date": e.start_date,
            "category": e.category or "General",
            "price": e.price or 0,
            "image": e.banner or "",
            "venue": e.venue or "",
            "city": e.city or "",
        }
        for e in evts
    ]


# ─── Categories ────────────────────────────────────────────────────────────────
@app.get("/categories", tags=["events"])
def list_categories(db: Session = Depends(get_db)):
    """Return unique event categories."""
    rows = (
        db.query(Event.category, func.count(Event.id).label("eventCount"))
        .filter(Event.status == "Published", Event.category.isnot(None))
        .group_by(Event.category)
        .all()
    )
    default_categories = [
        {"id": "1", "name": "Music", "icon": "🎵", "eventCount": 0, "status": "Active"},
        {"id": "2", "name": "Technology", "icon": "💻", "eventCount": 0, "status": "Active"},
        {"id": "3", "name": "Food", "icon": "🍽️", "eventCount": 0, "status": "Active"},
        {"id": "4", "name": "Sports", "icon": "⚽", "eventCount": 0, "status": "Active"},
        {"id": "5", "name": "Art", "icon": "🎨", "eventCount": 0, "status": "Active"},
        {"id": "6", "name": "Business", "icon": "💼", "eventCount": 0, "status": "Active"},
    ]
    if rows:
        return [
            {"id": str(i + 1), "name": r[0], "icon": "🎪", "eventCount": r[1], "status": "Active"}
            for i, r in enumerate(rows)
        ]
    return default_categories


# ─── QR Tickets ────────────────────────────────────────────────────────────────
@app.get("/qrTickets", tags=["attendee-dashboard"])
def qr_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return attendee's bookings formatted as QR tickets."""
    bookings_list = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id, Booking.status == "Confirmed")
        .all()
    )
    result = []
    for b in bookings_list:
        attendee = db.query(Attendee).filter(Attendee.booking_id == b.id).first()
        evt = db.query(Event).filter(Event.id == b.event_id).first()
        result.append({
            "id": b.id,
            "eventId": b.event_id,
            "eventName": b.event_name,
            "ticketName": b.ticket_name,
            "quantity": b.quantity,
            "totalPaid": b.total_paid,
            "status": b.status,
            "checkInStatus": b.check_in_status,
            "qrCode": attendee.qr_code if attendee else f"QR-{b.id}",
            "date": b.created_at.isoformat() if b.created_at else None,
            "venue": evt.venue if evt else "",
            "startDate": evt.start_date if evt else "",
            "startTime": evt.start_time if evt else "",
            "banner": evt.banner if evt else "",
        })
    return result


# ─── Organizers (admin convenience) ────────────────────────────────────────────
@app.get("/organizers", tags=["admin"])
def list_organizers(db: Session = Depends(get_db)):
    """Return all organizer accounts with profile details."""
    orgs = db.query(User).filter(User.role == "organizer").all()
    return [
        {
            "id": o.id,
            "name": o.name,
            "email": o.email,
            "phone": o.phone or "",
            "location": o.location or "",
            "about": o.about or "",
            "logo": o.logo or "",
            "website": o.website or "",
            "twitter": o.twitter or "",
            "linkedin": o.linkedin or "",
            "status": "Active" if o.is_active else "Inactive",
            "verified": o.is_verified,
            "is_active": o.is_active,
        }
        for o in orgs
    ]


@app.patch("/organizers/{organizer_id}", tags=["admin"])
def update_organizer(
    organizer_id: str,
    payload: dict,
    db: Session = Depends(get_db),
):
    """Update organizer profile/status."""
    org = db.query(User).filter(User.id == organizer_id, User.role == "organizer").first()
    if not org:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Organizer not found")
    for key, value in payload.items():
        if hasattr(org, key):
            setattr(org, key, value)
    db.commit()
    db.refresh(org)
    return {"id": org.id, "status": "Active" if org.is_active else "Inactive"}
