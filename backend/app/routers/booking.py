from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.booking import Booking
from app.models.event import Event
from app.models.coupon import Coupon
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.coupon import validate_and_calculate_discount


router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def booking_response(booking, event_title):
    return {
        "id": booking.id,
        "user_id": booking.user_id,
        "event_id": booking.event_id,
        "event_title": event_title,
        "ticket_quantity": booking.ticket_quantity,
        "total_price": booking.total_price,
        "booking_status": booking.booking_status,
        "coupon_id": booking.coupon_id,
        "discount_amount": booking.discount_amount,
        "final_amount": booking.final_amount,
    }


@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    event = db.query(Event).filter(
        Event.id == booking_data.event_id
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.event_status in ["CANCELLED", "COMPLETED"]:
        raise HTTPException(
            status_code=400,
            detail="Event is not available for booking",
        )

    if event.available_tickets < booking_data.ticket_quantity:
        raise HTTPException(
            status_code=400,
            detail="Not enough tickets available",
        )

    total_price = round(
        event.ticket_price * booking_data.ticket_quantity, 2
    )
    coupon = None
    discount_amount = 0.0
    final_amount = total_price

    if booking_data.coupon_code:
        coupon, discount_amount, final_amount = (
            validate_and_calculate_discount(
                db, booking_data.coupon_code, total_price
            )
        )

    try:
        event.available_tickets -= booking_data.ticket_quantity

        booking = Booking(
            user_id=current_user.id,
            event_id=event.id,
            ticket_quantity=booking_data.ticket_quantity,
            total_price=total_price,
            coupon_id=coupon.id if coupon else None,
            discount_amount=discount_amount,
            final_amount=final_amount,
            booking_status="PENDING",
        )

        db.add(booking)
        db.commit()
        db.refresh(booking)

        return booking_response(booking, event.title)

    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Booking could not be created",
        ) from exc


@router.get("/", response_model=list[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    bookings = (
        db.query(Booking, Event.title.label("event_title"))
        .join(Event, Booking.event_id == Event.id)
        .filter(Booking.user_id == current_user.id)
        .all()
    )
    return [
        booking_response(booking, event_title)
        for booking, event_title in bookings
    ]


@router.get(
    "/organizer/my-bookings",
    response_model=list[BookingResponse],
)
def get_organizer_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ORGANIZER")),
):
    bookings = (
        db.query(Booking, Event.title.label("event_title"))
        .join(Event, Booking.event_id == Event.id)
        .filter(Event.organizer_id == current_user.id)
        .all()
    )
    return [
        booking_response(booking, event_title)
        for booking, event_title in bookings
    ]
