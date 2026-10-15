from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.models.booking import Booking
from app.models.event import Event

router = APIRouter(prefix="/api/users", tags=["Users"])


class ProfileUpdate(BaseModel):
    username: str = Field(min_length=2, max_length=100)
    email: EmailStr
    profile_image: str | None = Field(default=None, max_length=500)
    phone: str | None = Field(default=None, max_length=20)
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=30)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)


def profile_response(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_image": user.profile_image,
        "phone": user.phone,
        "date_of_birth": (
            user.date_of_birth.isoformat()
            if user.date_of_birth
            else None
        ),
        "gender": user.gender,
        "city": user.city,
        "state": user.state,
        "role": user.role,
        "created_at": user.created_at,
    }


@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    return profile_response(current_user)


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    username = data.username.strip()

    if len(username) < 2:
        raise HTTPException(
            status_code=422,
            detail="Username must contain at least 2 characters",
        )

    existing_user = (
        db.query(User)
        .filter(
            User.email == str(data.email),
            User.id != current_user.id,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already in use",
        )

    current_user.username = username
    current_user.email = str(data.email)
    current_user.profile_image = data.profile_image
    current_user.phone = data.phone
    current_user.date_of_birth = data.date_of_birth
    current_user.gender = data.gender
    current_user.city = data.city
    current_user.state = data.state

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        **profile_response(current_user),
    }


@router.get("/profile/activity")
def get_profile_activity(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    bookings = (
        db.query(Booking, Event)
        .join(Event, Booking.event_id == Event.id)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    total_bookings = len(bookings)
    total_tickets = sum(
        booking.ticket_quantity for booking, _ in bookings
    )

    total_spent = sum(
        (
            booking.final_amount
            if booking.final_amount is not None
            else booking.total_price
        )
        for booking, _ in bookings
        if booking.booking_status.upper() not in {"CANCELLED", "FAILED"}
    )

    return {
        "summary": {
            "total_bookings": total_bookings,
            "total_tickets": total_tickets,
            "total_spent": round(total_spent, 2),
        },
        "bookings": [
            {
                "booking_id": booking.id,
                "event_id": event.id,
                "event_title": event.title,
                "ticket_quantity": booking.ticket_quantity,
                "amount": round(
                    (
                        booking.final_amount
                        if booking.final_amount is not None
                        else booking.total_price
                    ),
                    2,
                ),
                "status": booking.booking_status,
                "created_at": booking.created_at,
            }
            for booking, event in bookings
        ],
    }


@router.get("/admin-test")
def admin_test(current_user=Depends(require_role("ADMIN"))):
    return {
        "message": "Admin access granted",
        "user_id": current_user.id,
        "role": current_user.role,
    }
