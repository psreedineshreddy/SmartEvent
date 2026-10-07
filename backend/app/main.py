from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import Base, engine
from app.models import User, Event, Booking, Ticket, Notification

from app.routers import auth, user, event, booking, ticket, notification
from app.services.reminder import create_event_reminders


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
    scheduler.add_job(
        create_event_reminders,
        "interval",
        hours=1,
        id="event_reminder_job",
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


@app.get("/")
def root():
    return {
        "message": "SmartEvent API is running"
    }