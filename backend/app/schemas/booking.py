from pydantic import BaseModel, Field, ConfigDict


class BookingCreate(BaseModel):
    event_id: int
    ticket_quantity: int = Field(gt=0, le=10)
    coupon_code: str | None = Field(default=None, min_length=3, max_length=50)


class BookingResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    event_title: str
    ticket_quantity: int
    total_price: float
    booking_status: str
    coupon_id: int | None = None
    discount_amount: float = 0.0
    final_amount: float | None = None

    model_config = ConfigDict(from_attributes=True)

