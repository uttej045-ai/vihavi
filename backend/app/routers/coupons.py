from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.coupon import Coupon
from app.models.user import User
from app.schemas.coupon import CouponCreate, CouponUpdate, CouponOut, CouponValidateRequest, CouponValidateResponse
from app.dependencies import get_current_user, require_organizer

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.get("", response_model=List[CouponOut])
def list_coupons(
    event_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """List coupons for an event."""
    query = db.query(Coupon)
    if event_id:
        query = query.filter(Coupon.event_id == event_id)
    return query.all()


@router.post("", response_model=CouponOut, status_code=status.HTTP_201_CREATED)
def create_coupon(
    payload: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    """Create a coupon code."""
    existing = db.query(Coupon).filter(Coupon.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=409, detail="Coupon code already exists")
    coupon = Coupon(**payload.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.patch("/{coupon_id}", response_model=CouponOut)
def update_coupon(
    coupon_id: str,
    payload: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(coupon, key, value)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_organizer),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    return {"message": "Coupon deleted"}


@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(
    payload: CouponValidateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Validate a coupon code and calculate the discount."""
    coupon = db.query(Coupon).filter(Coupon.code == payload.code).first()
    if not coupon or not coupon.active:
        return CouponValidateResponse(valid=False, message="Invalid or inactive coupon code")

    if payload.event_id and coupon.event_id and coupon.event_id != payload.event_id:
        return CouponValidateResponse(valid=False, message="Coupon not valid for this event")

    if coupon.limit and coupon.used_count >= coupon.limit:
        return CouponValidateResponse(valid=False, message="Coupon usage limit reached")

    # Calculate discount
    discount_amount = 0.0
    if coupon.discount_type == "Percentage":
        discount_amount = round(payload.amount * (coupon.value / 100), 2)
    else:
        discount_amount = min(coupon.value, payload.amount)

    final_amount = max(0.0, payload.amount - discount_amount)

    return CouponValidateResponse(
        valid=True,
        discount_type=coupon.discount_type,
        value=coupon.value,
        discount_amount=discount_amount,
        final_amount=final_amount,
        message=f"Coupon applied! You save ₹{discount_amount:.2f}",
    )
