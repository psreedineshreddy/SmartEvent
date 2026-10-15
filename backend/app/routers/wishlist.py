from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models.event import Event
from app.models.wishlist import Wishlist

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("/")
def get_wishlist(
    current_user=Depends(require_role("USER")),
    db: Session = Depends(get_db),
):
    items = (
        db.query(Wishlist, Event)
        .join(Event, Wishlist.event_id == Event.id)
        .filter(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )

    return [
        {
            **{
                column.name: getattr(event, column.name)
                for column in Event.__table__.columns
            },
            "wishlist_id": wishlist.id,
            "saved_at": wishlist.created_at,
        }
        for wishlist, event in items
    ]


@router.post("/{event_id}", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    event_id: int,
    current_user=Depends(require_role("USER")),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.event_id == event_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Event is already in your wishlist",
        )

    item = Wishlist(user_id=current_user.id, event_id=event_id)
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": "Event added to wishlist",
        "wishlist_id": item.id,
        "event_id": item.event_id,
    }


@router.delete("/{event_id}")
def remove_from_wishlist(
    event_id: int,
    current_user=Depends(require_role("USER")),
    db: Session = Depends(get_db),
):
    item = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.event_id == event_id,
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Event is not in your wishlist",
        )

    db.delete(item)
    db.commit()

    return {"message": "Event removed from wishlist"}
