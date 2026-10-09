from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    description: str
    category: Literal["Music", "Tech", "Sports", "Business", "Art & Culture"]
    location: str
    event_date: datetime
    ticket_price: float
    available_tickets: int = 100
    banner_image: str | None = None

class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: Literal["Music", "Tech", "Sports", "Business", "Art & Culture"] | None = None
    location: str | None = None
    event_date: datetime | None = None
    ticket_price: float | None = None
    available_tickets: int | None = None
    banner_image: str | None = None

class EventResponse(BaseModel):
    id: int
    title: str
    description: str
    category: Literal["Music", "Tech", "Sports", "Business", "Art & Culture"]
    location: str
    event_date: datetime
    ticket_price: float
    available_tickets: int
    banner_image: str | None = None
    organizer_id: int | None = None
    event_status: Literal[
        "UPCOMING",
        "ONGOING",
        "COMPLETED",
        "CANCELLED"
    ]

    model_config = {"from_attributes": True}