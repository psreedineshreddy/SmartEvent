from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.booking import Booking
from app.models.ticket import Ticket
from app.models.event import Event
from app.schemas.ticket import TicketResponse


router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)


@router.get(
    "/",
    response_model=list[TicketResponse]
)
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tickets = (
        db.query(Ticket)
        .join(
            Booking,
            Ticket.booking_id == Booking.id
        )
        .filter(
            Booking.user_id == current_user.id
        )
        .all()
    )

    return tickets


@router.get("/verify/{ticket_code}")
def verify_ticket(
    ticket_code: str,
    db: Session = Depends(get_db)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_code == ticket_code)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Invalid ticket"
        )

    booking = (
        db.query(Booking)
        .filter(Booking.id == ticket.booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    event = (
        db.query(Event)
        .filter(Event.id == booking.event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return {
        "valid": True,
        "ticket_code": ticket.ticket_code,
        "booking_id": booking.id,
        "event_id": event.id,
        "event_title": event.title,
        "event_date": event.event_date,
        "ticket_quantity": booking.ticket_quantity,
        "booking_status": booking.booking_status
    }