from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime, timezone

from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    location = Column(String(200), nullable=False)
    event_date = Column(DateTime, nullable=False)
    ticket_price = Column(Float, nullable=False)
    available_tickets = Column(Integer, nullable=False, default=100)
    banner_image = Column(String(500), nullable=True)

    organizer_id = Column(Integer, nullable=True)
    event_status = Column(
        String(20),
        nullable=False,
        default="UPCOMING"
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )