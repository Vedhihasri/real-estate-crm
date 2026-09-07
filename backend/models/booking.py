from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.connection import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    lead_id = Column(
        Integer,
        ForeignKey("leads.id", ondelete="RESTRICT"),
        nullable=False
    )

    unit_id = Column(
        Integer,
        ForeignKey("units.id", ondelete="RESTRICT"),
        nullable=False
    )

    booked_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False
    )

    booking_date = Column(
        DateTime,
        server_default=func.now()
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationships
    lead = relationship("Lead")
    unit = relationship("Unit")
    booked_by_user = relationship("User")