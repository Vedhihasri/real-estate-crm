from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database.connection import get_db
from models.booking import Booking
from models.lead import Lead
from models.property import Unit
from models.user import User
from schemas.booking import BookingCreate, BookingResponse
from services.auth_dependencies import require_sales_employee


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


def booking_response(booking):
    return {
        "id": booking.id,

        "lead_id": booking.lead_id,
        "lead_name": booking.lead.name,
        "lead_phone": booking.lead.phone,

        "unit_id": booking.unit_id,
        "unit_number": booking.unit.unit_number,
        "unit_type": booking.unit.type,
        "unit_price": booking.unit.price,

        "booked_by": booking.booked_by,
        "booked_by_name": booking.booked_by_user.name,

        "booking_date": booking.booking_date,
        "created_at": booking.created_at,
    }


@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    try:

        # Lock unit row to prevent simultaneous bookings
        unit = (
            db.query(Unit)
            .filter(Unit.id == booking_data.unit_id)
            .with_for_update()
            .first()
        )

        if not unit:
            raise HTTPException(
                status_code=404,
                detail="Unit not found"
            )

        # Unit already booked
        if unit.status == "BOOKED":
            raise HTTPException(
                status_code=409,
                detail="Unit is already booked"
            )

        # Check lead
        lead = (
            db.query(Lead)
            .filter(Lead.id == booking_data.lead_id)
            .first()
        )

        if not lead:
            raise HTTPException(
                status_code=404,
                detail="Lead not found"
            )

        # Create booking
        booking = Booking(
            lead_id=booking_data.lead_id,
            unit_id=booking_data.unit_id,
            booked_by=current_user.id
        )

        db.add(booking)

        # Mark unit as booked
        unit.status = "BOOKED"

        # Move lead to Booked stage
        lead.stage = "Booked"

        db.commit()
        db.refresh(booking)

        return booking_response(booking)

    except HTTPException:
        db.rollback()
        raise

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Booking conflict: unit may already be booked"
        )

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to create booking"
        )


@router.get(
    "/",
    response_model=list[BookingResponse]
)
def get_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    bookings = (
        db.query(Booking)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return [
        booking_response(booking)
        for booking in bookings
    ]


@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return booking_response(booking)