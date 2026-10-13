from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.booking import Booking
from app.models.event import Event
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("/event/{event_id}")
def get_event_reviews(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    reviews = (
        db.query(Review)
        .filter(Review.event_id == event_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    average = db.query(func.avg(Review.rating)).filter(
        Review.event_id == event_id
    ).scalar()

    return {
        "event_id": event_id,
        "average_rating": round(float(average or 0), 2),
        "total_reviews": len(reviews),
        "reviews": [
            ReviewResponse.model_validate(review) for review in reviews
        ],
    }


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    event = db.query(Event).filter(Event.id == data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event_date = event.event_date
    if event_date.tzinfo is None:
        event_date = event_date.replace(tzinfo=timezone.utc)
    if event_date > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400, detail="You can review an event after it has ended"
        )

    booking = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.event_id == data.event_id,
        Booking.booking_status == "CONFIRMED",
    ).first()
    if not booking:
        raise HTTPException(
            status_code=403,
            detail="Only users with a confirmed booking can review this event",
        )

    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.event_id == data.event_id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=409, detail="You have already reviewed this event"
        )

    review = Review(
        user_id=current_user.id,
        event_id=data.event_id,
        rating=data.rating,
        review_text=data.review_text.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can edit only your own reviews")

    if data.rating is None and data.review_text is None:
        raise HTTPException(status_code=400, detail="Provide a rating or review text")
    if data.rating is not None:
        review.rating = data.rating
    if data.review_text is not None:
        review.review_text = data.review_text.strip()

    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("USER")),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can delete only your own reviews")

    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}
