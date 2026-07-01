from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.notification import Notification
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate, EventOut
from app.dependencies import get_current_user, require_organizer, require_admin, get_optional_user

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventOut])
def list_events(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    organizer_id: Optional[str] = Query(None),
    created_by: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """List events. Public users see Published events only. Organizers see their own."""
    query = db.query(Event)

    # Non-admins only see Published events (unless fetching own)
    if current_user is None or current_user.role == "attendee":
        query = query.filter(Event.status == "Published", Event.visibility == "Public")
    elif current_user.role == "organizer":
        if organizer_id:
            query = query.filter(Event.organizer_id == organizer_id)
        elif created_by:
            query = query.filter(Event.organizer_id == current_user.id)
        # otherwise organizers see their own events in any status
        else:
            pass

    if status:
        query = query.filter(Event.status == status)
    if category:
        query = query.filter(Event.category == category)
    if city:
        query = query.filter(Event.city.ilike(f"%{city}%"))
    if featured is not None:
        query = query.filter(Event.featured == featured)

    return query.offset(skip).limit(limit).all()


@router.get("/{event_id}", response_model=EventOut)
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get a single event by ID."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """Create a new event (organizer/admin)."""
    event_data = payload.model_dump(exclude={"tickets", "coupons"})
    event = Event(
        **event_data,
        organizer_id=current_user.id,
        status="Draft" if not payload.agree_to_terms else "Pending",
    )
    db.add(event)
    db.flush()  # get event.id before committing

    # Create tickets if provided
    if payload.tickets:
        for t in payload.tickets:
            ticket = Ticket(
                event_id=event.id,
                name=t.get("name", "General Admission"),
                desc=t.get("desc", ""),
                price=t.get("price", 0.0),
                quantity=t.get("quantity", 100),
                sale_start=t.get("saleStart", t.get("sale_start")),
                sale_end=t.get("saleEnd", t.get("sale_end")),
                min_limit=t.get("minLimit", t.get("min_limit", 1)),
                max_limit=t.get("maxLimit", t.get("max_limit", 10)),
                benefits=t.get("benefits", ""),
            )
            db.add(ticket)

    # Notify organizer
    notif = Notification(
        user_id=current_user.id,
        type="booking",
        message=f'Created new event "{event.name}" successfully.',
    )
    db.add(notif)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=EventOut)
def update_event(
    event_id: str,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """Update an event. Organizers can only edit their own events."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
    event.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """Delete an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}


@router.patch("/{event_id}/approve", response_model=EventOut)
def approve_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Approve an event and publish it (admin only)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = "Published"
    event.updated_at = datetime.now(timezone.utc)

    # Notify organizer
    notif = Notification(
        user_id=event.organizer_id,
        type="system",
        message=f'Your event "{event.name}" has been approved and published!',
    )
    db.add(notif)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}/reject", response_model=EventOut)
def reject_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Reject an event (admin only)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = "Rejected"
    event.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=event.organizer_id,
        type="system",
        message=f'Your event "{event.name}" has been rejected. Please review and resubmit.',
    )
    db.add(notif)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}/publish", response_model=EventOut)
def publish_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """Submit event for review (organizer) or publish directly (admin)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    event.status = "Published" if current_user.role == "admin" else "Pending"
    event.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(event)
    return event
