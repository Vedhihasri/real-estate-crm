from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class BookingCreate(BaseModel):
    lead_id: int
    unit_id: int


class BookingResponse(BaseModel):
    id: int

    lead_id: int
    lead_name: str
    lead_phone: str

    unit_id: int
    unit_number: str
    unit_type: str
    unit_price: Decimal

    booked_by: int
    booked_by_name: str

    booking_date: datetime
    created_at: datetime