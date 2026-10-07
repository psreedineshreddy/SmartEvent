from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    category: Literal["Music", "Tech", "Sports", "Business"]
    location: str
    event_date: datetime
    ticket_price: float
    available_tickets: int
    banner_image: str | None = None

    model_config = {"from_attributes": True}