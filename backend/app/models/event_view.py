
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime, timezone

from app.database import Base


class EventView(Base):
    __tablename__ = "event_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )
    event_id = Column(
        Integer,
        ForeignKey("events.id"),
        nullable=False,
    )
    viewed_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

