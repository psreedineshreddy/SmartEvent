from datetime import datetime, timedelta, timezone

from app.database import SessionLocal
from app.models.booking import Booking
from app.models.event import Event
from app.models.notification import Notification


def create_event_reminders():
    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)
        reminder_limit = now + timedelta(hours=24)

        bookings = (
            db.query(Booking)
            .join(Event, Booking.event_id == Event.id)
            .filter(
                Booking.booking_status == "CONFIRMED",
                Event.event_date >= now,
                Event.event_date <= reminder_limit
            )
            .all()
        )

        for booking in bookings:
            event = db.query(Event).filter(
                Event.id == booking.event_id
            ).first()

            if not event:
                continue

            existing_notification = (
                db.query(Notification)
                .filter(
                    Notification.user_id == booking.user_id,
                    Notification.type == "EVENT",
                    Notification.message == (
                        f"Reminder: {event.title} is happening within 24 hours."
                    )
                )
                .first()
            )

            if existing_notification:
                continue

            notification = Notification(
                user_id=booking.user_id,
                title="Event Reminder",
                message=f"Reminder: {event.title} is happening within 24 hours.",
                type="EVENT",
                is_read=False
            )

            db.add(notification)

        db.commit()

    finally:
        db.close()
