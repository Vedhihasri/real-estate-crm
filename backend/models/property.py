from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.connection import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text)

    created_at = Column(DateTime, server_default=func.now())


class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(String(100), nullable=False)

    created_at = Column(DateTime, server_default=func.now())


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)

    building_id = Column(
        Integer,
        ForeignKey("buildings.id", ondelete="CASCADE"),
        nullable=False
    )

    unit_number = Column(String(50), nullable=False)
    type = Column(String(20), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="AVAILABLE"
    )

    created_at = Column(DateTime, server_default=func.now())

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )