import os
import uuid

import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.booking import Booking
from app.models.event import Event
from app.models.payment import Payment
from app.models.ticket import Ticket
from app.models.notification import Notification
from app.models.coupon import Coupon
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment import generate_transaction_id, simulate_payment


router = APIRouter(prefix="/api/payments", tags=["Payments"])

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
QR_DIR = os.path.join(BASE_DIR, "static", "qr_codes")
os.makedirs(QR_DIR, exist_ok=True)


@router.get("/my-payments", response_model=list[PaymentResponse])
def get_my_payments(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    return (
        db.query(Payment)
        .join(Booking, Payment.booking_id == Booking.id)
        .filter(Booking.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )



@router.post(
    "/",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    booking = db.query(Booking).filter(
        Booking.id == payment_data.booking_id,
        Booking.user_id == current_user.id,
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.booking_status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Only pending bookings can be paid",
        )

    previous_success = db.query(Payment).filter(
        Payment.booking_id == booking.id,
        Payment.payment_status == "SUCCESS",
    ).first()

    if previous_success:
        raise HTTPException(
            status_code=400,
            detail="This booking has already been paid",
        )

    event = db.query(Event).filter(
        Event.id == booking.event_id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    amount = (
        booking.final_amount
        if booking.final_amount is not None
        else booking.total_price
    )

    success, message = simulate_payment(
        amount,
        payment_data.simulate_failure,
    )

    transaction_id = generate_transaction_id()

    payment = Payment(
        booking_id=booking.id,
        payment_method=payment_data.payment_method,
        payment_status="SUCCESS" if success else "FAILED",
        transaction_id=transaction_id,
        amount=amount,
    )

    qr_path = None

    try:
        db.add(payment)

        if success:
            if booking.coupon_id is not None:
                coupon = (
                    db.query(Coupon)
                    .filter(Coupon.id == booking.coupon_id)
                    .with_for_update()
                    .first()
                )

                if not coupon or not coupon.is_active:
                    raise HTTPException(
                        status_code=400,
                        detail="Applied coupon is no longer available",
                    )

                if coupon.used_count >= coupon.usage_limit:
                    raise HTTPException(
                        status_code=400,
                        detail="Coupon usage limit reached",
                    )

                coupon.used_count += 1

            booking.booking_status = "CONFIRMED"

            ticket_code = str(uuid.uuid4()).upper()
            qr_filename = f"{ticket_code}.png"
            qr_path = os.path.join(QR_DIR, qr_filename)
            qrcode.make(ticket_code).save(qr_path)

            db.add(
                Ticket(
                    booking_id=booking.id,
                    ticket_code=ticket_code,
                    qr_code_url=f"/static/qr_codes/{qr_filename}",
                )
            )

            db.add(
                Notification(
                    user_id=current_user.id,
                    title="Booking Confirmed",
                    message=f"Your booking for {event.title} is confirmed.",
                    type="BOOKING",
                    is_read=False,
                )
            )

            notification_title = "Payment Successful"

        else:
            booking.booking_status = "FAILED"
            event.available_tickets += booking.ticket_quantity
            notification_title = "Payment Failed"

        db.add(
            Notification(
                user_id=current_user.id,
                title=notification_title,
                message=message,
                type="PAYMENT",
                is_read=False,
            )
        )

        db.commit()
        db.refresh(payment)
        return payment

    except Exception as exc:
        db.rollback()

        if qr_path and os.path.exists(qr_path):
            os.remove(qr_path)

        if isinstance(exc, SQLAlchemyError):
            raise HTTPException(
                status_code=500,
                detail="Payment could not be recorded",
            ) from exc

        raise
