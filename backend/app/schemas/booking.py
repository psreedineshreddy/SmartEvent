from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    event_id: int
    ticket_quantity: int = Field(gt=0, le=10)



class BookingResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    event_title: str
    ticket_quantity: int
    total_price: float
    booking_status: str

    model_config = {"from_attributes": True}
