from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_leads: int
    new_leads: int
    contacted_leads: int
    site_visits: int
    interested_leads: int
    negotiation_leads: int
    booked_leads: int
    lost_leads: int

    total_projects: int
    total_units: int
    available_units: int
    booked_units: int

    total_bookings: int
    upcoming_followups: int