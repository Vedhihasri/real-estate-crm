from database.connection import SessionLocal
from models.user import User
from services.auth_service import hash_password


db = SessionLocal()


def create_user(
    name,
    email,
    password,
    role
):
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        print(f"{email} already exists")
        return

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=role
    )

    db.add(user)
    db.commit()

    print(f"Created: {email}")


try:

    create_user(
        "Admin User",
        "admin@realestate.com",
        "Admin@123",
        "ADMIN"
    )

    create_user(
        "Sales Employee",
        "sales@realestate.com",
        "Sales@123",
        "SALES_EMPLOYEE"
    )

finally:
    db.close()