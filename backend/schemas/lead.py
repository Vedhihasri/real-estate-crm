from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class LeadCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    stage: str = "New"
    assigned_to: Optional[int] = None
    follow_up_date: Optional[date] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    stage: Optional[str] = None
    assigned_to: Optional[int] = None
    follow_up_date: Optional[date] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    email: Optional[EmailStr]
    phone: str
    stage: str
    assigned_to: Optional[int]
    assigned_employee_name: Optional[str] = None
    follow_up_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    note: str


class NoteResponse(BaseModel):
    id: int
    lead_id: int
    user_id: Optional[int]
    note: str
    created_at: datetime

    class Config:
        from_attributes = True