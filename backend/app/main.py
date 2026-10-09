from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import Base, engine
from app.models import User, Event, Booking, Ticket, Notification

from app.routers import auth, user, event, booking, ticket, notification, admin
from app.services.reminder import create_event_reminders
from app.services.event_status import update_event_statuses


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
    name="static"
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
        replace_existing=True
    )

    scheduler.add_job(
        update_event_statuses,
        "interval",
        minutes=1,
        id="event_status_job",
        replace_existing=True
    )

    scheduler.start()


@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()


app.include_router(auth.router)
app.include_router(user.router)
app.include_router(event.router)
app.include_router(booking.router)
app.include_router(ticket.router)
app.include_router(notification.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "SmartEvent API is running"
    }