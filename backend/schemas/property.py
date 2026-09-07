from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


# PROJECT

class ProjectCreate(BaseModel):
    name: str
    location: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    location: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# BUILDING

class BuildingCreate(BaseModel):
    project_id: int
    name: str


class BuildingResponse(BaseModel):
    id: int
    project_id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


# UNIT

class UnitCreate(BaseModel):
    building_id: int
    unit_number: str
    type: str
    price: Decimal


class UnitUpdate(BaseModel):
    unit_number: Optional[str] = None
    type: Optional[str] = None
    price: Optional[Decimal] = None
    status: Optional[str] = None


class UnitResponse(BaseModel):
    id: int
    building_id: int
    unit_number: str
    type: str
    price: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True