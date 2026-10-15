from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Announcement, Event

router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
)


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=1, max_length=10000)


class AnnouncementResponse(BaseModel):
    id: int
    event_id: int
    organizer_id: int
    title: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


def check_announcement_permission(announcement, current_user, db):
    if current_user.role == "ADMIN":
        return

    if current_user.role != "ORGANIZER":
        raise HTTPException(
            status_code=403,
            detail="Only organizers and admins can manage announcements",
        )

    event = db.query(Event).filter(
        Event.id == announcement.event_id
    ).first()

    if not event or event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage announcements for your own events",
        )


@router.get(
    "/{event_id}",
    response_model=list[AnnouncementResponse],
)
def get_event_announcements(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return (
        db.query(Announcement)
        .filter(Announcement.event_id == event_id)
        .order_by(Announcement.created_at.desc())
        .all()
    )


@router.post(
    "/{event_id}",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_announcement(
    event_id: int,
    data: AnnouncementCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("ORGANIZER", "ADMIN"):
        raise HTTPException(
            status_code=403,
            detail="Only organizers and admins can post announcements",
        )

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if (
        current_user.role == "ORGANIZER"
        and event.organizer_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only announce updates for your own events",
        )

    announcement = Announcement(
        event_id=event_id,
        organizer_id=current_user.id,
        title=data.title.strip(),
        message=data.message.strip(),
    )

    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return announcement


@router.delete(
    "/item/{announcement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_announcement(
    announcement_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    announcement = (
        db.query(Announcement)
        .filter(Announcement.id == announcement_id)
        .first()
    )

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    check_announcement_permission(announcement, current_user, db)

    db.delete(announcement)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
