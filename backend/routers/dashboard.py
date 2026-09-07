from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from models.lead import Lead
from models.property import Project, Unit
from models.booking import Booking
from models.user import User

from schemas.dashboard import DashboardResponse

from services.auth_dependencies import require_sales_employee


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/",
    response_model=DashboardResponse
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    total_leads = db.query(Lead).count()

    new_leads = db.query(Lead).filter(
        Lead.stage == "New"
    ).count()

    contacted_leads = db.query(Lead).filter(
        Lead.stage == "Contacted"
    ).count()

    site_visits = db.query(Lead).filter(
        Lead.stage == "Site Visit"
    ).count()

    interested_leads = db.query(Lead).filter(
        Lead.stage == "Interested"
    ).count()

    negotiation_leads = db.query(Lead).filter(
        Lead.stage == "Negotiation"
    ).count()

    booked_leads = db.query(Lead).filter(
        Lead.stage == "Booked"
    ).count()

    lost_leads = db.query(Lead).filter(
        Lead.stage == "Lost"
    ).count()

    total_projects = db.query(Project).count()

    total_units = db.query(Unit).count()

    available_units = db.query(Unit).filter(
        Unit.status == "AVAILABLE"
    ).count()

    booked_units = db.query(Unit).filter(
        Unit.status == "BOOKED"
    ).count()

    total_bookings = db.query(Booking).count()

    upcoming_followups = db.query(Lead).filter(
        Lead.follow_up_date >= date.today(),
        Lead.stage.notin_(["Booked", "Lost"])
    ).count()

    return DashboardResponse(
        total_leads=total_leads,
        new_leads=new_leads,
        contacted_leads=contacted_leads,
        site_visits=site_visits,
        interested_leads=interested_leads,
        negotiation_leads=negotiation_leads,
        booked_leads=booked_leads,
        lost_leads=lost_leads,

        total_projects=total_projects,
        total_units=total_units,
        available_units=available_units,
        booked_units=booked_units,

        total_bookings=total_bookings,
        upcoming_followups=upcoming_followups
    )