from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database.connection import get_db
from models.lead import Lead, LeadNote
from models.user import User
from schemas.lead import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    NoteCreate,
    NoteResponse
)
from services.auth_dependencies import (
    require_sales_employee,
    require_admin
)


router = APIRouter(
    prefix="/leads",
    tags=["Leads"]
)


VALID_STAGES = [
    "New",
    "Contacted",
    "Site Visit",
    "Interested",
    "Negotiation",
    "Booked",
    "Lost"
]


def lead_response(lead):
    """
    Convert Lead database object into API response
    including the assigned employee name.
    """

    employee_name = None

    if lead.assigned_to:
        employee = (
            db_user := None
        )

    return {
        "id": lead.id,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "stage": lead.stage,
        "assigned_to": lead.assigned_to,
        "assigned_employee_name": employee_name,
        "follow_up_date": lead.follow_up_date,
        "created_at": lead.created_at,
    }


def build_lead_response(db: Session, lead: Lead):
    """
    Build LeadResponse with assigned employee name.
    """

    employee_name = None

    if lead.assigned_to:
        employee = (
            db.query(User)
            .filter(User.id == lead.assigned_to)
            .first()
        )

        if employee:
            employee_name = employee.name

    return {
        "id": lead.id,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "stage": lead.stage,
        "assigned_to": lead.assigned_to,
        "assigned_employee_name": employee_name,
        "follow_up_date": lead.follow_up_date,
        "created_at": lead.created_at,
    }


# =========================================================
# CREATE LEAD
# =========================================================

@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED
)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    if lead_data.stage not in VALID_STAGES:
        raise HTTPException(
            status_code=400,
            detail="Invalid lead stage"
        )

    # Sales employee automatically owns the lead
    if current_user.role == "SALES_EMPLOYEE":
        assigned_to = current_user.id
    else:
        assigned_to = lead_data.assigned_to

    # Validate assigned employee
    if assigned_to:
        employee = (
            db.query(User)
            .filter(User.id == assigned_to)
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Assigned employee not found"
            )

        if employee.role not in [
            "ADMIN",
            "SALES_EMPLOYEE"
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid employee assignment"
            )

    lead = Lead(
        name=lead_data.name,
        email=lead_data.email,
        phone=lead_data.phone,
        stage=lead_data.stage,
        assigned_to=assigned_to,
        follow_up_date=lead_data.follow_up_date
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return build_lead_response(db, lead)


# =========================================================
# GET ALL LEADS
# =========================================================

@router.get(
    "",
    response_model=list[LeadResponse]
)
def get_leads(
    search: str | None = Query(None),
    stage: str | None = Query(None),
    assigned_to: int | None = Query(None),
    follow_up_date: date | None = Query(None),

    db: Session = Depends(get_db),

    current_user: User = Depends(require_sales_employee)
):
    query = db.query(Lead)

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            or_(
                Lead.name.ilike(search_value),
                Lead.email.ilike(search_value),
                Lead.phone.ilike(search_value)
            )
        )

    if stage:
        if stage not in VALID_STAGES:
            raise HTTPException(
                status_code=400,
                detail="Invalid lead stage"
            )

        query = query.filter(
            Lead.stage == stage
        )

    if assigned_to:
        query = query.filter(
            Lead.assigned_to == assigned_to
        )

    if follow_up_date:
        query = query.filter(
            Lead.follow_up_date == follow_up_date
        )

    # Sales employees see only their own leads
    # Admin can see everything
    if current_user.role == "SALES_EMPLOYEE":
        query = query.filter(
            Lead.assigned_to == current_user.id
        )

    leads = query.order_by(
        Lead.created_at.desc()
    ).all()

    return [
        build_lead_response(db, lead)
        for lead in leads
    ]


# =========================================================
# GET SINGLE LEAD
# =========================================================

@router.get(
    "/{lead_id}",
    response_model=LeadResponse
)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    # Sales employee can only view their own leads
    if (
        current_user.role == "SALES_EMPLOYEE"
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this lead"
        )

    return build_lead_response(db, lead)


# =========================================================
# UPDATE LEAD
# =========================================================

@router.put(
    "/{lead_id}",
    response_model=LeadResponse
)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    # Sales employee can only update their own leads
    if (
        current_user.role == "SALES_EMPLOYEE"
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this lead"
        )

    data = lead_data.model_dump(
        exclude_unset=True
    )

    # Validate stage
    if "stage" in data:
        if data["stage"] not in VALID_STAGES:
            raise HTTPException(
                status_code=400,
                detail="Invalid lead stage"
            )

    # Sales employees cannot reassign leads
    if current_user.role == "SALES_EMPLOYEE":
        data.pop("assigned_to", None)

    # Validate assignment for Admin
    if (
        current_user.role == "ADMIN"
        and "assigned_to" in data
        and data["assigned_to"]
    ):
        employee = (
            db.query(User)
            .filter(User.id == data["assigned_to"])
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Assigned employee not found"
            )

        if employee.role not in [
            "ADMIN",
            "SALES_EMPLOYEE"
        ]:
            raise HTTPException(
                status_code=400,
                detail="Invalid employee assignment"
            )

    for field, value in data.items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)

    return build_lead_response(db, lead)


# =========================================================
# DELETE LEAD — ADMIN ONLY
# =========================================================

@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    db.delete(lead)
    db.commit()

    return None


# =========================================================
# ADD NOTE
# =========================================================

@router.post(
    "/{lead_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED
)
def add_note(
    lead_id: int,
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    if (
        current_user.role == "SALES_EMPLOYEE"
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this lead"
        )

    note = LeadNote(
        lead_id=lead_id,
        user_id=current_user.id,
        note=note_data.note
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return note


# =========================================================
# GET NOTES
# =========================================================

@router.get(
    "/{lead_id}/notes",
    response_model=list[NoteResponse]
)
def get_notes(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if not lead:
        raise HTTPException(
            status_code=404,
            detail="Lead not found"
        )

    if (
        current_user.role == "SALES_EMPLOYEE"
        and lead.assigned_to != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this lead"
        )

    return (
        db.query(LeadNote)
        .filter(LeadNote.lead_id == lead_id)
        .order_by(LeadNote.created_at.desc())
        .all()
    )