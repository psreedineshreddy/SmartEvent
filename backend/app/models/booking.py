
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from datetime import datetime, timezone

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    ticket_quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=True)
    discount_amount = Column(Float, nullable=False, default=0.0)
    final_amount = Column(Float, nullable=True)
    booking_status = Column(String(20), default="PENDING", nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
