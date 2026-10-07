from datetime import datetime, timedelta, timezone

from app.database import SessionLocal
from app.models.event import Event


db = SessionLocal()

events = [
    Event(
        title="Bangalore Music Festival",
        description="A live music festival featuring popular artists and bands.",
        category="Music",
        location="Bangalore",
        event_date=datetime.now(timezone.utc) + timedelta(days=10),
        ticket_price=999,
        available_tickets=100,
        banner_image="/static/event_images/music.jpg"
    ),
    Event(
        title="Tech Innovation Summit",
        description="Explore the latest technology trends, AI and innovation.",
        category="Tech",
        location="Bangalore",
        event_date=datetime.now(timezone.utc) + timedelta(days=15),
        ticket_price=1499,
        available_tickets=80,
        banner_image="/static/event_images/tech.jpg"
    ),
    Event(
        title="City Sports Championship",
        description="An exciting sports championship featuring multiple teams.",
        category="Sports",
        location="Bangalore",
        event_date=datetime.now(timezone.utc) + timedelta(days=20),
        ticket_price=499,
        available_tickets=150,
        banner_image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211"
    ),
    Event(
        title="Business Leadership Conference",
        description="A professional conference focused on business and leadership.",
        category="Business",
        location="Bangalore",
        event_date=datetime.now(timezone.utc) + timedelta(days=25),
        ticket_price=1999,
        available_tickets=60,
        banner_image="/static/event_images/business.jpg"
    )
]

db.add_all(events)
db.commit()

print("Sample events created successfully.")

db.close()
