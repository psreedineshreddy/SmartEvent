from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.models.booking import Booking
from app.models.notification import Notification
from app.models.event_view import EventView
from app.schemas.event import EventResponse, EventCreate, EventUpdate
from app.dependencies import require_role, get_optional_current_user

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.post("/", response_model=EventResponse, status_code=201)
def create_event(
    event_data: EventCreate,
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db),
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
        event_status="UPCOMING",
    )

    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/", response_model=list[EventResponse])
def get_events(
    search: str | None = None,
    category: str | None = None,
    location: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort_by: str = "date",
    db: Session = Depends(get_db),
):
    query = db.query(Event)

    if search:
        query = query.filter(Event.title.ilike(f"%{search.strip()}%"))

    if category:
        query = query.filter(Event.category.ilike(category.strip()))

    if location:
        query = query.filter(Event.location.ilike(f"%{location.strip()}%"))

    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be later than end_date",
        )

    if start_date:
        query = query.filter(Event.event_date >= start_date)

    if end_date:
        query = query.filter(Event.event_date <= end_date)

    if min_price is not None and min_price < 0:
        raise HTTPException(
            status_code=400,
            detail="min_price cannot be negative",
        )

    if max_price is not None and max_price < 0:
        raise HTTPException(
            status_code=400,
            detail="max_price cannot be negative",
        )

    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise HTTPException(
            status_code=400,
            detail="min_price cannot be greater than max_price",
        )

    if min_price is not None:
        query = query.filter(Event.ticket_price >= min_price)

    if max_price is not None:
        query = query.filter(Event.ticket_price <= max_price)

    if sort_by == "date":
        query = query.order_by(Event.event_date.asc())

    elif sort_by == "date_desc":
        query = query.order_by(Event.event_date.desc())

    elif sort_by == "price":
        query = query.order_by(Event.ticket_price.asc())

    elif sort_by == "price_desc":
        query = query.order_by(Event.ticket_price.desc())

    elif sort_by == "popularity":
        query = (
            query.outerjoin(
                Booking,
                Booking.event_id == Event.id,
            )
            .filter(
                (Booking.id.is_(None))
                | (Booking.booking_status == "CONFIRMED")
            )
            .group_by(Event.id)
            .order_by(
                func.coalesce(
                    func.sum(Booking.ticket_quantity), 0
                ).desc()
            )
        )

    else:
        raise HTTPException(
            status_code=400,
            detail=(
                "sort_by must be date, date_desc, price, "
                "price_desc, or popularity"
            ),
        )

    return query.all()


@router.get("/recommendations/me", response_model=list[EventResponse])
def get_personalized_recommendations(
    current_user=Depends(require_role("USER")),
    db: Session = Depends(get_db),
):
    viewed_events = (
        db.query(EventView, Event)
        .join(Event, EventView.event_id == Event.id)
        .filter(EventView.user_id == current_user.id)
        .all()
    )

    confirmed_bookings = (
        db.query(Booking, Event)
        .join(Event, Booking.event_id == Event.id)
        .filter(
            Booking.user_id == current_user.id,
            Booking.booking_status == "CONFIRMED",
        )
        .all()
    )

    category_scores = {}
    location_scores = {}

    for view, event in viewed_events:
        category_scores[event.category] = (
            category_scores.get(event.category, 0) + 1
        )
        location_scores[event.location] = (
            location_scores.get(event.location, 0) + 1
        )

    for booking, event in confirmed_bookings:
        category_scores[event.category] = (
            category_scores.get(event.category, 0) + 3
        )
        location_scores[event.location] = (
            location_scores.get(event.location, 0) + 2
        )

    popular_events = (
        db.query(
            Event.id,
            func.coalesce(
                func.sum(Booking.ticket_quantity), 0
            ).label("tickets_sold"),
        )
        .outerjoin(
            Booking,
            (Booking.event_id == Event.id)
            & (Booking.booking_status == "CONFIRMED"),
        )
        .group_by(Event.id)
        .all()
    )

    popularity = {
        event_id: tickets_sold
        for event_id, tickets_sold in popular_events
    }

    events = (
        db.query(Event)
        .filter(
            Event.event_status == "UPCOMING",
            Event.available_tickets > 0,
        )
        .all()
    )

    events.sort(
        key=lambda event: (
            category_scores.get(event.category, 0),
            location_scores.get(event.location, 0),
            popularity.get(event.id, 0),
        ),
        reverse=True,
    )

    return events[:10]


@router.get("/trending", response_model=list[EventResponse])
def get_trending_events(db: Session = Depends(get_db)):
    return (
        db.query(Event)
        .outerjoin(
            Booking,
            (Booking.event_id == Event.id)
            & (Booking.booking_status == "CONFIRMED"),
        )
        .filter(
            Event.event_status == "UPCOMING",
            Event.available_tickets > 0,
        )
        .group_by(Event.id)
        .order_by(
            func.coalesce(
                func.sum(Booking.ticket_quantity), 0
            ).desc(),
            Event.event_date.asc(),
        )
        .limit(10)
        .all()
    )


@router.get("/organizer/my-events", response_model=list[EventResponse])
def get_my_events(
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db),
):
    return (
        db.query(Event)
        .filter(Event.organizer_id == current_user.id)
        .all()
    )


@router.get("/organizer/insights")
def get_organizer_insights(
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db),
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

        confirmed_bookings = [
            booking
            for booking in bookings
            if booking.booking_status == "CONFIRMED"
        ]

        tickets_sold = sum(
            booking.ticket_quantity
            for booking in confirmed_bookings
        )

        total_revenue = sum(
            booking.final_amount
            if booking.final_amount is not None
            else booking.total_price
            for booking in confirmed_bookings
        )

        insights.append(
            {
                "event_id": event.id,
                "event_title": event.title,
                "event_status": event.event_status,
                "tickets_sold": tickets_sold,
                "remaining_tickets": (
                    0
                    if event.event_status == "CANCELLED"
                    else event.available_tickets
                ),
                "booking_count": len(confirmed_bookings),
                "total_revenue": total_revenue,
            }
        )

    return insights


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_current_user),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user is not None:
        db.add(
            EventView(
                user_id=current_user.id,
                event_id=event.id,
            )
        )
        db.commit()

    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own events",
        )

    update_data = event_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(event, field, value)

    bookings = (
        db.query(Booking)
        .filter(
            Booking.event_id == event.id,
            Booking.booking_status == "CONFIRMED",
        )
        .all()
    )

    for booking in bookings:
        db.add(
            Notification(
                user_id=booking.user_id,
                title="Event Updated",
                message=(
                    f"The event '{event.title}' has been updated. "
                    "Please check the latest event details."
                ),
                type="EVENT",
                is_read=False,
            )
        )

    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}/cancel", response_model=EventResponse)
def cancel_event(
    event_id: int,
    current_user=Depends(require_role("ORGANIZER")),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own events",
        )

    if event.event_status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Event is already cancelled",
        )

    event.event_status = "CANCELLED"

    bookings = (
        db.query(Booking)
        .filter(
            Booking.event_id == event.id,
            Booking.booking_status == "CONFIRMED",
        )
        .all()
    )

    for booking in bookings:
        db.add(
            Notification(
                user_id=booking.user_id,
                title="Event Cancelled",
                message=f"The event '{event.title}' has been cancelled.",
                type="EVENT",
                is_read=False,
            )
        )

    db.commit()
    db.refresh(event)
    return event
