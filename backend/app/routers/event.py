from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventResponse

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("/", response_model=list[EventResponse])
def get_events(
    search: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)

    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))

    if category:
        query = query.filter(Event.category.ilike(category))

    return query.all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    return event