
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.coupon import Coupon
from app.schemas.coupon import (
    CouponCreate,
    CouponResponse,
    CouponApply,
    CouponApplyResponse,
)
from app.services.coupon import validate_and_calculate_discount


router = APIRouter(prefix="/api/coupons", tags=["Coupons"])


@router.post(
    "/",
    response_model=CouponResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_coupon(
    data: CouponCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN")),
):
    code = data.coupon_code.strip().upper()

    if data.discount_type == "PERCENTAGE" and data.discount_value > 100:
        raise HTTPException(
            status_code=400,
            detail="Percentage discount cannot exceed 100%",
        )

    if db.query(Coupon).filter(Coupon.coupon_code == code).first():
        raise HTTPException(status_code=409, detail="Coupon code already exists")

    coupon = Coupon(
        coupon_code=code,
        discount_type=data.discount_type,
        discount_value=data.discount_value,
        minimum_booking_amount=data.minimum_booking_amount,
        expiry_date=data.expiry_date,
        usage_limit=data.usage_limit,
        is_active=data.is_active,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("/", response_model=list[CouponResponse])
def list_coupons(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN")),
):
    return db.query(Coupon).order_by(Coupon.id.desc()).all()


@router.post("/validate", response_model=CouponApplyResponse)
def validate_coupon(
    data: CouponApply,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    coupon, discount, final_amount = validate_and_calculate_discount(
        db,
        data.coupon_code,
        data.booking_amount,
    )

    return CouponApplyResponse(
        coupon_code=coupon.coupon_code,
        discount_amount=discount,
        final_amount=final_amount,
        message="Coupon applied successfully",
    )

