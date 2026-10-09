from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.booking import Booking
from app.models.notification import Notification
from app.schemas.event import EventResponse, EventCreate, EventUpdate
from app.dependencies import require_role

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.post("/", response_model=EventResponse, status_code=201)
def create_event(
    event_data: EventCreate,
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db)
):
    event = Event(
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        location=event_data.location,
        event_date=event_data.event_date,
        ticket_price=event_data.ticket_price,
        available_tickets=event_data.available_tickets,
        banner_image=event_data.banner_image,
        organizer_id=current_user.id,
        event_status="UPCOMING"
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own events"
        )

    update_data = event_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(event, field, value)

    bookings = (
        db.query(Booking)
        .filter(
            Booking.event_id == event.id,
            Booking.booking_status == "CONFIRMED"
        )
        .all()
    )

    for booking in bookings:
        notification = Notification(
            user_id=booking.user_id,
            title="Event Updated",
            message=(
                f"The event '{event.title}' has been updated. "
                "Please check the latest event details."
            ),
            type="EVENT",
            is_read=False
        )

        db.add(notification)

    db.commit()
    db.refresh(event)

    return event


@router.patch("/{event_id}/cancel", response_model=EventResponse)
def cancel_event(
    event_id: int,
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own events"
        )

    if event.event_status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Event is already cancelled"
        )

    event.event_status = "CANCELLED"

    bookings = (
        db.query(Booking)
        .filter(
            Booking.event_id == event.id,
            Booking.booking_status == "CONFIRMED"
        )
        .all()
    )

    for booking in bookings:
        notification = Notification(
            user_id=booking.user_id,
            title="Event Cancelled",
            message=(
                f"The event '{event.title}' has been cancelled."
            ),
            type="EVENT",
            is_read=False
        )

        db.add(notification)

    db.commit()
    db.refresh(event)

    return event


@router.get("/organizer/my-events", response_model=list[EventResponse])
def get_my_events(
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db)
):
    return (
        db.query(Event)
        .filter(Event.organizer_id == current_user.id)
        .all()
    )


@router.get("/organizer/insights")
def get_organizer_insights(
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db)
):
    events = (
        db.query(Event)
        .filter(Event.organizer_id == current_user.id)
        .all()
    )

    insights = []

    for event in events:
        bookings = (
            db.query(Booking)
            .filter(Booking.event_id == event.id)
            .all()
        )

        tickets_sold = sum(
            booking.ticket_quantity
            for booking in bookings
            if booking.booking_status == "CONFIRMED"
        )

        total_revenue = sum(
            booking.total_price
            for booking in bookings
            if booking.booking_status == "CONFIRMED"
        )

        booking_count = sum(
            1
            for booking in bookings
            if booking.booking_status == "CONFIRMED"
        )

        insights.append({
            "event_id": event.id,
            "event_title": event.title,
            "event_status": event.event_status,
            "tickets_sold": tickets_sold,
            "remaining_tickets": (
    0 if event.event_status == "CANCELLED"
    else event.available_tickets
),
            "booking_count": booking_count,
            "total_revenue": total_revenue
        })

    return insights


@router.get("/", response_model=list[EventResponse])
def get_events(
    search: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)

    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))

    if category:
        query = query.filter(Event.category.ilike(category))

    return query.all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event