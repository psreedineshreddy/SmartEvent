from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.event import Event
from app.models.booking import Booking
from app.models.user import User
from app.schemas.chatbot import ChatbotRequest, ChatbotResponse
from app.services.chatbot import generate_chatbot_reply

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])


@router.post("/chat", response_model=ChatbotResponse)
def chat_with_assistant(
    request: ChatbotRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        events = (
            db.query(Event)
            .filter(
                Event.event_date >= now,
                Event.event_status == "UPCOMING",
            )
            .order_by(Event.event_date.asc())
            .limit(30)
            .all()
        )

        bookings = (
            db.query(Booking)
            .filter(Booking.user_id == current_user.id)
            .order_by(Booking.created_at.desc())
            .limit(20)
            .all()
        )

        event_context = [
            {
                "id": event.id,
                "title": event.title,
                "category": event.category,
                "location": event.location,
                "event_date": event.event_date.isoformat(),
                "ticket_price": event.ticket_price,
                "available_tickets": event.available_tickets,
                "event_status": event.event_status,
            }
            for event in events
        ]

        booking_context = []

        for booking in bookings:
            event = (
                db.query(Event)
                .filter(Event.id == booking.event_id)
                .first()
            )

            booking_context.append(
                {
                    "booking_id": booking.id,
                    "event_title": (
                        event.title if event else "Event unavailable"
                    ),
                    "ticket_quantity": booking.ticket_quantity,
                    "total_price": booking.total_price,
                    "booking_status": booking.booking_status,
                }
            )

        history = [
            {"role": item["role"], "content": item["content"]}
            for item in request.history
            if item.get("role") in {"user", "assistant"}
            and isinstance(item.get("content"), str)
        ]

        reply = generate_chatbot_reply(
            message=request.message.strip(),
            events=event_context,
            bookings=booking_context,
            history=history,
        )

        return ChatbotResponse(
            reply=reply,
            suggestions=[
                "Trending events",
                "Suggest music events this weekend",
                "Show my bookings",
                "Help with ticket issues",
            ],
        )

    except RuntimeError as exc:
        if "API key is not configured" in str(exc):
            raise HTTPException(
                status_code=503,
                detail="The AI chatbot is not configured yet.",
            ) from exc

        print(f"Chatbot error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="The AI service could not generate a response.",
        ) from exc

    except Exception as exc:
        print(f"Chatbot error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Unable to process your chatbot request right now.",
        ) from exc
