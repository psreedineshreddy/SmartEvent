from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import Base, engine, SessionLocal
from app.models import (
    User,
    Event,
    Booking,
    Ticket,
    Notification,
    Payment,
    Coupon,
    Review,
    Announcement,
)
from app.routers import (
    auth,
    user,
    event,
    booking,
    ticket,
    notification,
    admin,
    payment,
    coupon,
    review,
    wishlist,
    announcement,
    chatbot,
)
from app.services.reminder import create_event_reminders
from app.services.event_status import update_event_statuses
from app.services.availability import availability_manager


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartEvent – Event Discovery & Ticket Booking System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)

scheduler = BackgroundScheduler()


@app.on_event("startup")
def start_scheduler():
    update_event_statuses()

    scheduler.add_job(
        create_event_reminders,
        "interval",
        hours=1,
        id="event_reminder_job",
        replace_existing=True,
    )

    scheduler.add_job(
        update_event_statuses,
        "interval",
        minutes=1,
        id="event_status_job",
        replace_existing=True,
    )

    scheduler.start()


@app.on_event("shutdown")
def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()


app.include_router(auth.router)
app.include_router(user.router)
app.include_router(event.router)
app.include_router(booking.router)
app.include_router(ticket.router)
app.include_router(notification.router)
app.include_router(admin.router)
app.include_router(payment.router)
app.include_router(coupon.router)
app.include_router(review.router)
app.include_router(wishlist.router, prefix="/api")
app.include_router(announcement.router, prefix="/api")
app.include_router(chatbot.router)


@app.websocket("/ws/events/{event_id}/availability")
async def event_availability(websocket: WebSocket, event_id: int):
    await availability_manager.connect(event_id, websocket)
    db = SessionLocal()

    try:
        event = (
            db.query(Event)
            .filter(Event.id == event_id)
            .first()
        )

        if not event:
            await websocket.close(
                code=1008,
                reason="Event not found",
            )
            return

        await websocket.send_json(
            {
                "type": "availability_update",
                "event_id": event.id,
                "available_tickets": event.available_tickets,
            }
        )

        # Keep the connection open until the client disconnects.
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        pass

    finally:
        await availability_manager.disconnect(event_id, websocket)
        db.close()


@app.get("/")
def root():
    return {
        "message": "SmartEvent API is running"
    }
