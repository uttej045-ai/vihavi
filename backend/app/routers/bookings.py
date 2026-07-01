from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models.booking import Booking
from app.models.ticket import Ticket
from app.models.event import Event
from app.models.payment import Payment
from app.models.attendee import Attendee
from app.models.notification import Notification
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingUpdate, BookingOut
from app.dependencies import get_current_user, require_organizer, require_admin

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=List[BookingOut])
def list_bookings(
    event_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List bookings. Filtered by role."""
    query = db.query(Booking)

    if current_user.role == "attendee":
        # Attendees only see their own bookings
        query = query.filter(Booking.user_id == current_user.id)
    elif current_user.role == "organizer":
        # Organizers see bookings for their events
        if event_id:
            event = db.query(Event).filter(Event.id == event_id).first()
            if event and event.organizer_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized")
            query = query.filter(Booking.event_id == event_id)
        else:
            organizer_event_ids = [
                e.id for e in db.query(Event).filter(Event.organizer_id == current_user.id).all()
            ]
            query = query.filter(Booking.event_id.in_(organizer_event_ids))
    else:
        # Admin: filter optionally
        if event_id:
            query = query.filter(Booking.event_id == event_id)
        if user_id:
            query = query.filter(Booking.user_id == user_id)

    if status:
        query = query.filter(Booking.status == status)

    return query.offset(skip).limit(limit).all()


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role == "attendee" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return booking


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new booking."""
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    ticket = None
    ticket_price = 0.0
    ticket_name = "General Admission"
    if payload.ticket_id:
        ticket = db.query(Ticket).filter(Ticket.id == payload.ticket_id).first()
        if ticket:
            ticket_price = ticket.price
            ticket_name = ticket.name
            if ticket.sold + payload.quantity > ticket.quantity:
                raise HTTPException(status_code=400, detail="Not enough tickets available")

    total_paid = ticket_price * payload.quantity

    booking = Booking(
        event_id=payload.event_id,
        ticket_id=payload.ticket_id,
        user_id=current_user.id,
        user_name=payload.user_name or current_user.name,
        user_email=payload.user_email or current_user.email,
        user_phone=payload.user_phone or current_user.phone,
        ticket_name=ticket_name,
        ticket_price=ticket_price,
        event_name=event.name,
        quantity=payload.quantity,
        total_paid=total_paid,
        status="Confirmed",
    )
    db.add(booking)
    db.flush()

    # Update ticket sold count
    if ticket:
        ticket.sold += payload.quantity

    # Create payment record
    payment = Payment(
        booking_id=booking.id,
        amount=total_paid,
        status="Pending" if total_paid > 0 else "Success",
    )
    db.add(payment)

    # Create attendee record
    attendee = Attendee(
        booking_id=booking.id,
        event_id=payload.event_id,
        name=booking.user_name,
        email=booking.user_email,
        phone=booking.user_phone,
        qr_code=f"QR-{booking.id}",
    )
    db.add(attendee)

    # Notify organizer
    notif = Notification(
        user_id=event.organizer_id,
        type="booking",
        message=f"New booking for \"{event.name}\" by {booking.user_name} ({payload.quantity} ticket{'s' if payload.quantity > 1 else ''})",
    )
    db.add(notif)

    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/{booking_id}", response_model=BookingOut)
def update_booking(
    booking_id: str,
    payload: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update booking status (organizer/admin)."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role not in ("organizer", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(booking, key, value)
    booking.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/{booking_id}/checkin", response_model=BookingOut)
def check_in_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """Mark booking as checked in."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.check_in_status = "Checked In"
    booking.checked_in_at = datetime.now(timezone.utc)
    booking.updated_at = datetime.now(timezone.utc)

    # Also update attendee record
    attendee = db.query(Attendee).filter(Attendee.booking_id == booking_id).first()
    if attendee:
        attendee.checked_in = True
        attendee.checked_in_at = booking.checked_in_at

    db.commit()
    db.refresh(booking)
    return booking
