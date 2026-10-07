from pydantic import BaseModel
from datetime import datetime


class TicketResponse(BaseModel):
    id: int
    booking_id: int
    ticket_code: str
    qr_code_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}