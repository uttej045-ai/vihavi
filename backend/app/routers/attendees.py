from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models.attendee import Attendee, Wishlist
from app.models.event import Event
from app.models.user import User
from app.schemas.attendee import (
    AttendeeCreate, AttendeeUpdate, AttendeeOut,
    WishlistCreate, WishlistOut
)
from app.dependencies import get_current_user, require_organizer

router = APIRouter(tags=["attendees & wishlist"])


# ─── Attendees ────────────────────────────────────────────────────────────────

@router.get("/attendees", response_model=List[AttendeeOut])
def list_attendees(
    event_id: Optional[str] = Query(None),
    booking_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    query = db.query(Attendee)
    if event_id:
        query = query.filter(Attendee.event_id == event_id)
    if booking_id:
        query = query.filter(Attendee.booking_id == booking_id)
    return query.all()


@router.get("/attendees/{attendee_id}", response_model=AttendeeOut)
def get_attendee(
    attendee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    attendee = db.query(Attendee).filter(Attendee.id == attendee_id).first()
    if not attendee:
        raise HTTPException(status_code=404, detail="Attendee not found")
    return attendee


@router.patch("/attendees/{attendee_id}/checkin", response_model=AttendeeOut)
def checkin_attendee(
    attendee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """Check in an attendee by their ID (QR scan)."""
    attendee = db.query(Attendee).filter(Attendee.id == attendee_id).first()
    if not attendee:
        # Also try by QR code
        attendee = db.query(Attendee).filter(Attendee.qr_code == attendee_id).first()
    if not attendee:
        raise HTTPException(status_code=404, detail="Attendee not found")
    if attendee.checked_in:
        raise HTTPException(status_code=400, detail="Attendee already checked in")

    attendee.checked_in = True
    attendee.checked_in_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(attendee)
    return attendee


# ─── Wishlist ─────────────────────────────────────────────────────────────────

@router.get("/wishlist", response_model=List[WishlistOut])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's wishlist."""
    return db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()


@router.post("/wishlist", response_model=WishlistOut, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    payload: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add an event to wishlist."""
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id, Wishlist.event_id == payload.event_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Event already in wishlist")

    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    item = Wishlist(user_id=current_user.id, event_id=payload.event_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/wishlist/{wishlist_id}")
def remove_from_wishlist(
    wishlist_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove an item from wishlist by ID or event_id."""
    item = db.query(Wishlist).filter(
        Wishlist.id == wishlist_id, Wishlist.user_id == current_user.id
    ).first()
    if not item:
        # Try by event_id
        item = db.query(Wishlist).filter(
            Wishlist.event_id == wishlist_id, Wishlist.user_id == current_user.id
        ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}
