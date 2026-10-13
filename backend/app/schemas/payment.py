
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    booking_id: int = Field(gt=0)
    payment_method: Literal["UPI", "CARD", "NET_BANKING", "SIMULATION"] = "SIMULATION"
    simulate_failure: bool = False


class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    payment_method: str
    payment_status: Literal["PENDING", "SUCCESS", "FAILED"]
    transaction_id: str | None
    amount: float
    created_at: datetime

    model_config = {"from_attributes": True}
