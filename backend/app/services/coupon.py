
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.coupon import Coupon


def validate_and_calculate_discount(
    db: Session,
    coupon_code: str,
    booking_amount: float,
) -> tuple[Coupon, float, float]:
    code = coupon_code.strip().upper()

    coupon = db.query(Coupon).filter(
        Coupon.coupon_code == code
    ).first()

    if not coupon or not coupon.is_active:
        raise HTTPException(status_code=400, detail="Invalid or inactive coupon")

    expiry = coupon.expiry_date
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)

    if expiry <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Coupon has expired")

    if coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    if booking_amount < coupon.minimum_booking_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum booking amount is {coupon.minimum_booking_amount:.2f}",
        )

    if coupon.discount_type == "PERCENTAGE":
        if coupon.discount_value > 100:
            raise HTTPException(
                status_code=400,
                detail="Percentage discount cannot exceed 100%",
            )
        discount = booking_amount * coupon.discount_value / 100
    else:
        discount = coupon.discount_value

    discount = min(round(discount, 2), round(booking_amount, 2))
    final_amount = round(booking_amount - discount, 2)

    return coupon, discount, final_amount

