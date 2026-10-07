import os
import uuid

import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.notification import Notification
from app.schemas.booking import BookingCreate, BookingResponse


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

QR_DIR = os.path.join(BASE_DIR, "static", "qr_codes")
os.makedirs(QR_DIR, exist_ok=True)


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)


@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    event = db.query(Event).filter(
        Event.id == booking_data.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    if event.available_tickets < booking_data.ticket_quantity:
        raise HTTPException(
            status_code=400,
            detail="Not enough tickets available"
        )

    total_price = (
        event.ticket_price * booking_data.ticket_quantity
    )

    qr_path = None

    try:
        event.available_tickets -= booking_data.ticket_quantity

        booking = Booking(
            user_id=current_user.id,
            event_id=event.id,
            ticket_quantity=booking_data.ticket_quantity,
            total_price=total_price,
            booking_status="CONFIRMED"
        )

        db.add(booking)
        db.flush()

        ticket_code = str(uuid.uuid4()).upper()

        qr = qrcode.make(ticket_code)

        qr_filename = f"{ticket_code}.png"
        qr_path = os.path.join(QR_DIR, qr_filename)

        qr.save(qr_path)

        ticket = Ticket(
            booking_id=booking.id,
            ticket_code=ticket_code,
            qr_code_url=f"/static/qr_codes/{qr_filename}"
        )

        db.add(ticket)

        notification = Notification(
            user_id=current_user.id,
            title="Booking Confirmed",
            message=(
                f"Your booking for {event.title} "
                "has been confirmed."
            ),
            type="BOOKING",
            is_read=False
        )

        db.add(notification)

        db.commit()
        db.refresh(booking)

        return booking

    except SQLAlchemyError:
        db.rollback()

        if qr_path and os.path.exists(qr_path):
            os.remove(qr_path)

        raise HTTPException(
            status_code=500,
            detail="Booking could not be completed"
        )

    except Exception:
        db.rollback()

        if qr_path and os.path.exists(qr_path):
            os.remove(qr_path)

        raise HTTPException(
            status_code=500,
            detail="Booking could not be completed"
        )


@router.get(
    "/",
    response_model=list[BookingResponse]
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).all()