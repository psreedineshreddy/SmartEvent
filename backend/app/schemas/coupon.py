
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class CouponCreate(BaseModel):
    coupon_code: str = Field(min_length=3, max_length=50)
    discount_type: Literal["PERCENTAGE", "FIXED"]
    discount_value: float = Field(gt=0)
    minimum_booking_amount: float = Field(default=0, ge=0)
    expiry_date: datetime
    usage_limit: int = Field(gt=0)
    is_active: bool = True


class CouponResponse(BaseModel):
    id: int
    coupon_code: str
    discount_type: str
    discount_value: float
    minimum_booking_amount: float
    expiry_date: datetime
    usage_limit: int
    used_count: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CouponApply(BaseModel):
    coupon_code: str = Field(min_length=3, max_length=50)
    booking_amount: float = Field(gt=0)


class CouponApplyResponse(BaseModel):
    coupon_code: str
    discount_amount: float
    final_amount: float
    message: str

