from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.event import Event
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.ticket import Ticket
from app.dependencies import require_admin, require_organizer, get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin dashboard summary stats."""
    total_users = db.query(func.count(User.id)).scalar()
    total_events = db.query(func.count(Event.id)).scalar()
    total_bookings = db.query(func.count(Booking.id)).scalar()
    total_revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == "Success").scalar() or 0.0
    pending_events = db.query(func.count(Event.id)).filter(Event.status == "Pending").scalar()
    active_organizers = db.query(func.count(User.id)).filter(User.role == "organizer", User.is_active == True).scalar()
    checked_in = db.query(func.count(Booking.id)).filter(Booking.check_in_status == "Checked In").scalar()

    # Revenue by month (last 6 months using booking dates)
    revenue_by_event = (
        db.query(Event.name, func.sum(Payment.amount).label("revenue"))
        .join(Booking, Booking.event_id == Event.id)
        .join(Payment, Payment.booking_id == Booking.id)
        .filter(Payment.status == "Success")
        .group_by(Event.name)
        .limit(10)
        .all()
    )

    # Category distribution
    category_counts = (
        db.query(Event.category, func.count(Event.id).label("count"))
        .filter(Event.status == "Published")
        .group_by(Event.category)
        .all()
    )

    return {
        "totalUsers": total_users,
        "totalEvents": total_events,
        "totalBookings": total_bookings,
        "totalRevenue": round(float(total_revenue), 2),
        "pendingApprovals": pending_events,
        "activeOrganizers": active_organizers,
        "checkedIn": checked_in,
        "revenueByEvent": [{"name": r[0], "revenue": float(r[1] or 0)} for r in revenue_by_event],
        "categoryDistribution": [{"category": c[0] or "Other", "count": c[1]} for c in category_counts],
    }


@router.get("/organizer/{organizer_id}")
def organizer_analytics(
    organizer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Organizer-specific analytics."""
    if current_user.role not in ("organizer", "admin"):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")

    if current_user.role == "organizer" and current_user.id != organizer_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")

    organizer_event_ids = [
        e.id for e in db.query(Event).filter(Event.organizer_id == organizer_id).all()
    ]

    total_events = len(organizer_event_ids)
    total_bookings = db.query(func.count(Booking.id)).filter(
        Booking.event_id.in_(organizer_event_ids)
    ).scalar() if organizer_event_ids else 0
    total_revenue = 0.0
    if organizer_event_ids:
        total_revenue = db.query(func.sum(Payment.amount)).join(
            Booking, Payment.booking_id == Booking.id
        ).filter(
            Booking.event_id.in_(organizer_event_ids),
            Payment.status == "Success"
        ).scalar() or 0.0
    checked_in = db.query(func.count(Booking.id)).filter(
        Booking.event_id.in_(organizer_event_ids),
        Booking.check_in_status == "Checked In"
    ).scalar() if organizer_event_ids else 0

    # Bookings per event
    bookings_per_event = []
    if organizer_event_ids:
        result = (
            db.query(Event.name, func.count(Booking.id).label("bookings"))
            .join(Booking, Booking.event_id == Event.id, isouter=True)
            .filter(Event.organizer_id == organizer_id)
            .group_by(Event.name)
            .all()
        )
        bookings_per_event = [{"event": r[0], "bookings": r[1]} for r in result]

    return {
        "totalEvents": total_events,
        "totalBookings": total_bookings,
        "totalRevenue": round(float(total_revenue), 2),
        "checkedIn": checked_in,
        "bookingsPerEvent": bookings_per_event,
    }


@router.get("/revenue")
def revenue_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Revenue analytics overview."""
    total = db.query(func.sum(Payment.amount)).filter(Payment.status == "Success").scalar() or 0.0
    pending = db.query(func.sum(Payment.amount)).filter(Payment.status == "Pending").scalar() or 0.0
    refunded = db.query(func.sum(Payment.amount)).filter(Payment.status == "Refunded").scalar() or 0.0

    by_method = (
        db.query(Payment.method, func.sum(Payment.amount).label("total"))
        .filter(Payment.status == "Success")
        .group_by(Payment.method)
        .all()
    )

    return {
        "totalRevenue": round(float(total), 2),
        "pendingRevenue": round(float(pending), 2),
        "refundedRevenue": round(float(refunded), 2),
        "byMethod": [{"method": r[0], "total": float(r[1] or 0)} for r in by_method],
    }
