from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime, time

from app.database import get_db
from app.dependencies import require_role
from app.models.user import User
from app.models.event import Event
from app.models.booking import Booking


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


@router.get("/overview")
def get_admin_overview(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_events = db.query(Event).count()
    total_bookings = db.query(Booking).count()

    total_tickets_sold = sum(
        booking.ticket_quantity
        for booking in db.query(Booking).filter(
            Booking.booking_status == "CONFIRMED"
        ).all()
    )

    total_revenue = sum(
        booking.total_price
        for booking in db.query(Booking).filter(
            Booking.booking_status == "CONFIRMED"
        ).all()
    )

    return {
        "total_users": total_users,
        "total_events": total_events,
        "total_bookings": total_bookings,
        "total_tickets_sold": total_tickets_sold,
        "total_revenue": total_revenue
    }


@router.get("/users")
def get_all_users(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
        for user in users
    ]

@router.get("/events")
def get_all_events(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    return db.query(Event).order_by(Event.id).all()

@router.get("/bookings")
def get_all_bookings(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    return db.query(Booking).order_by(Booking.id).all()

@router.get("/analytics/daily-ticket-sales")
def get_daily_ticket_sales(
    from_date: date | None = None,
    to_date: date | None = None,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).filter(
        Booking.booking_status == "CONFIRMED"
    ).all()

    daily_sales = {}

    for booking in bookings:
        booking_date = booking.created_at.date()

        if from_date and booking_date < from_date:
            continue

        if to_date and booking_date > to_date:
            continue

        date_key = booking_date.isoformat()

        if date_key not in daily_sales:
            daily_sales[date_key] = 0

        daily_sales[date_key] += booking.ticket_quantity

    return [
        {
            "date": date_key,
            "tickets_sold": tickets
        }
        for date_key, tickets in sorted(daily_sales.items())
    ]

@router.get("/analytics/monthly-booking-trends")
def get_monthly_booking_trends(
    from_date: date | None = None,
    to_date: date | None = None,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).filter(
        Booking.booking_status == "CONFIRMED"
    ).all()

    monthly_bookings = {}

    for booking in bookings:
        booking_date = booking.created_at.date()

        if from_date and booking_date < from_date:
            continue

        if to_date and booking_date > to_date:
            continue

        month = booking.created_at.strftime("%Y-%m")

        if month not in monthly_bookings:
            monthly_bookings[month] = 0

        monthly_bookings[month] += 1

    return [
        {
            "month": month,
            "bookings": count
        }
        for month, count in sorted(monthly_bookings.items())
    ]    

@router.get("/analytics/popular-events")
def get_popular_events(
    from_date: date | None = None,
    to_date: date | None = None,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    events = db.query(Event).all()

    popular_events = []

    for event in events:
        query = db.query(Booking).filter(
            Booking.event_id == event.id,
            Booking.booking_status == "CONFIRMED"
        )

        if from_date:
            query = query.filter(
                Booking.created_at >= datetime.combine(
                    from_date,
                    datetime.min.time()
                )
            )

        if to_date:
            query = query.filter(
                Booking.created_at <= datetime.combine(
                    to_date,
                    datetime.max.time()
                )
            )

        tickets_sold = sum(
            booking.ticket_quantity
            for booking in query.all()
        )

        popular_events.append({
            "event_id": event.id,
            "event_title": event.title,
            "tickets_sold": tickets_sold
        })

    popular_events.sort(
        key=lambda item: item["tickets_sold"],
        reverse=True
    )

    return popular_events


@router.get("/analytics/top-revenue-events")
def get_top_revenue_events(
    from_date: date | None = None,
    to_date: date | None = None,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    events = db.query(Event).all()

    revenue_events = []

    for event in events:
        query = db.query(Booking).filter(
            Booking.event_id == event.id,
            Booking.booking_status == "CONFIRMED"
        )

        if from_date:
            query = query.filter(
                Booking.created_at >= datetime.combine(
                    from_date,
                    datetime.min.time()
                )
            )

        if to_date:
            query = query.filter(
                Booking.created_at <= datetime.combine(
                    to_date,
                    datetime.max.time()
                )
            )

        total_revenue = sum(
            booking.total_price
            for booking in query.all()
        )

        revenue_events.append({
            "event_id": event.id,
            "event_title": event.title,
            "total_revenue": total_revenue
        })

    revenue_events.sort(
        key=lambda item: item["total_revenue"],
        reverse=True
    )

    return revenue_events