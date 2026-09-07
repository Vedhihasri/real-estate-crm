from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.sql import func

from database.connection import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255))
    phone = Column(String(20), nullable=False)
    stage = Column(String(30), nullable=False, default="New")

    assigned_to = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    follow_up_date = Column(Date)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )


class LeadNote(Base):
    __tablename__ = "lead_notes"

    id = Column(Integer, primary_key=True, index=True)

    lead_id = Column(
        Integer,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL")
    )

    note = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )