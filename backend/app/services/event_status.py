from datetime import datetime

from app.database import SessionLocal
from app.models.event import Event


def update_event_statuses():
    db = SessionLocal()

    try:
        now = datetime.now()

        events = (
            db.query(Event)
            .filter(Event.event_status == "UPCOMING")
            .all()
        )

        for event in events:
            if event.event_date <= now:
                event.event_status = "COMPLETED"

        db.commit()

    finally:
        db.close()