from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db

from models.property import (
    Project,
    Building,
    Unit
)

from models.user import User

from schemas.property import (
    ProjectCreate,
    ProjectResponse,
    BuildingCreate,
    BuildingResponse,
    UnitCreate,
    UnitUpdate,
    UnitResponse
)

from services.auth_dependencies import (
    require_admin,
    require_sales_employee
)


router = APIRouter(
    prefix="/properties",
    tags=["Properties"]
)


VALID_UNIT_TYPES = [
    "1BHK",
    "2BHK",
    "3BHK",
    "4BHK",
    "VILLA",
    "PLOT"
]

VALID_UNIT_STATUS = [
    "AVAILABLE",
    "BOOKED"
]


# =========================================================
# PROJECTS
# =========================================================

@router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = Project(
        name=project_data.name,
        location=project_data.location,
        description=project_data.description
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get(
    "/projects",
    response_model=list[ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    return db.query(Project).order_by(
        Project.created_at.desc()
    ).all()


@router.get(
    "/projects/{project_id}",
    response_model=ProjectResponse
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


@router.put(
    "/projects/{project_id}",
    response_model=ProjectResponse
)
def update_project(
    project_id: int,
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    project.name = project_data.name
    project.location = project_data.location
    project.description = project_data.description

    db.commit()
    db.refresh(project)

    return project


@router.delete(
    "/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return None


# =========================================================
# BUILDINGS
# =========================================================

@router.post(
    "/buildings",
    response_model=BuildingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_building(
    building_data: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = db.query(Project).filter(
        Project.id == building_data.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    existing = db.query(Building).filter(
        Building.project_id == building_data.project_id,
        Building.name == building_data.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Building already exists in this project"
        )

    building = Building(
        project_id=building_data.project_id,
        name=building_data.name
    )

    db.add(building)
    db.commit()
    db.refresh(building)

    return building


@router.get(
    "/buildings",
    response_model=list[BuildingResponse]
)
def get_buildings(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    query = db.query(Building)

    if project_id:
        query = query.filter(
            Building.project_id == project_id
        )

    return query.order_by(
        Building.created_at.desc()
    ).all()


@router.get(
    "/buildings/{building_id}",
    response_model=BuildingResponse
)
def get_building(
    building_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    building = db.query(Building).filter(
        Building.id == building_id
    ).first()

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found"
        )

    return building


@router.put(
    "/buildings/{building_id}",
    response_model=BuildingResponse
)
def update_building(
    building_id: int,
    building_data: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    building = db.query(Building).filter(
        Building.id == building_id
    ).first()

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found"
        )

    project = db.query(Project).filter(
        Project.id == building_data.project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    building.project_id = building_data.project_id
    building.name = building_data.name

    db.commit()
    db.refresh(building)

    return building


@router.delete(
    "/buildings/{building_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_building(
    building_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    building = db.query(Building).filter(
        Building.id == building_id
    ).first()

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found"
        )

    db.delete(building)
    db.commit()

    return None


# =========================================================
# UNITS
# =========================================================

@router.post(
    "/units",
    response_model=UnitResponse,
    status_code=status.HTTP_201_CREATED
)
def create_unit(
    unit_data: UnitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    building = db.query(Building).filter(
        Building.id == unit_data.building_id
    ).first()

    if not building:
        raise HTTPException(
            status_code=404,
            detail="Building not found"
        )

    if unit_data.type not in VALID_UNIT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid unit type. Allowed: {VALID_UNIT_TYPES}"
        )

    if unit_data.price < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
        )

    existing = db.query(Unit).filter(
        Unit.building_id == unit_data.building_id,
        Unit.unit_number == unit_data.unit_number
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Unit already exists in this building"
        )

    unit = Unit(
        building_id=unit_data.building_id,
        unit_number=unit_data.unit_number,
        type=unit_data.type,
        price=unit_data.price,
        status="AVAILABLE"
    )

    db.add(unit)
    db.commit()
    db.refresh(unit)

    return unit


@router.get(
    "/units",
    response_model=list[UnitResponse]
)
def get_units(
    building_id: int | None = None,
    status_filter: str | None = None,
    unit_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    query = db.query(Unit)

    if building_id:
        query = query.filter(
            Unit.building_id == building_id
        )

    if status_filter:
        if status_filter not in VALID_UNIT_STATUS:
            raise HTTPException(
                status_code=400,
                detail="Invalid unit status"
            )

        query = query.filter(
            Unit.status == status_filter
        )

    if unit_type:
        if unit_type not in VALID_UNIT_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Invalid unit type"
            )

        query = query.filter(
            Unit.type == unit_type
        )

    return query.order_by(
        Unit.unit_number
    ).all()


@router.get(
    "/units/{unit_id}",
    response_model=UnitResponse
)
def get_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_sales_employee)
):
    unit = db.query(Unit).filter(
        Unit.id == unit_id
    ).first()

    if not unit:
        raise HTTPException(
            status_code=404,
            detail="Unit not found"
        )

    return unit


@router.put(
    "/units/{unit_id}",
    response_model=UnitResponse
)
def update_unit(
    unit_id: int,
    unit_data: UnitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    unit = db.query(Unit).filter(
        Unit.id == unit_id
    ).first()

    if not unit:
        raise HTTPException(
            status_code=404,
            detail="Unit not found"
        )

    data = unit_data.model_dump(
        exclude_unset=True
    )

    if "type" in data:
        if data["type"] not in VALID_UNIT_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Invalid unit type"
            )

    if "status" in data:
        if data["status"] not in VALID_UNIT_STATUS:
            raise HTTPException(
                status_code=400,
                detail="Invalid unit status"
            )

    if "price" in data and data["price"] < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
        )

    for field, value in data.items():
        setattr(unit, field, value)

    db.commit()
    db.refresh(unit)

    return unit


@router.delete(
    "/units/{unit_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    unit = db.query(Unit).filter(
        Unit.id == unit_id
    ).first()

    if not unit:
        raise HTTPException(
            status_code=404,
            detail="Unit not found"
        )

    if unit.status == "BOOKED":
        raise HTTPException(
            status_code=400,
            detail="Booked unit cannot be deleted"
        )

    db.delete(unit)
    db.commit()

    return None