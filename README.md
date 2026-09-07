# Real Estate CRM

A full-stack Real Estate Customer Relationship Management (CRM) application designed to help real estate teams manage leads, sales employees, property inventory, and bookings through a centralized system.

The application implements role-based access control, lead ownership, property hierarchy management, and booking workflows with backend-enforced business rules and PostgreSQL data integrity constraints.

---

## Overview

The CRM is designed around two primary user roles:

* **Admin** — manages employees, leads, properties, and bookings.
* **Sales Employee** — manages assigned leads, follow-ups, notes, and bookings.

The application follows a client-server architecture:

```text
React Frontend
      ↓
FastAPI REST API
      ↓
SQLAlchemy
      ↓
PostgreSQL
```

Authentication and authorization are enforced at the backend, while the frontend provides the user interface and client-side route protection.

---

# Setup

## Prerequisites

Make sure the following are installed:

* Python 3.10+
* Node.js 18+
* PostgreSQL
* Git
* npm

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd real-estate-crm
```

---

# Backend Setup

## 2. Navigate to the Backend

```bash
cd backend
```

## 3. Create a Virtual Environment

### Windows

```bash
python -m venv venv
```

Activate the environment:

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/real_estate_crm
SECRET_KEY=your_secret_key
```

Update the database credentials according to your local PostgreSQL configuration.

> Do not commit `.env` or other sensitive credentials to the repository.

## 6. Create the PostgreSQL Database

Create a database named:

```text
real_estate_crm
```

Execute the database schema provided with the project to create the required tables.

Core entities include:

```text
users
leads
lead_notes
projects
buildings
units
bookings
```

## 7. Start the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open a new terminal while keeping the backend running.

## 8. Navigate to the Frontend

From the project root:

```bash
cd frontend
```

## 9. Install Dependencies

```bash
npm install
```

## 10. Start the Frontend

```bash
npm run dev
```

The Vite development server will display the frontend URL in the terminal.

Typically:

```text
http://localhost:5173
```

---

# Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Passlib
* bcrypt

## Database

* PostgreSQL

## Development & Testing

* Swagger / OpenAPI
* Postman
* VS Code
* Git
* GitHub

---

# Core Features

## Authentication & Authorization

* JWT-based authentication
* Secure password hashing
* Role-based access control
* Protected frontend routes
* Backend authorization
* Admin-only functionality
* Sales Employee lead ownership

Authentication flow:

```text
Login
  ↓
Credentials validated
  ↓
JWT generated
  ↓
JWT sent with authenticated requests
  ↓
Backend validates user
  ↓
Role and ownership permissions checked
```

---

# Lead Management

The CRM provides a complete lead management workflow.

Users can:

* Create leads
* View lead details
* Edit lead information
* Search and manage leads
* Assign leads
* Add notes
* Schedule follow-ups
* Track lead stages

Lead stages:

```text
New
Contacted
Site Visit
Interested
Negotiation
Booked
Lost
```

### Lead Ownership

Sales Employees are associated with their assigned leads.

When a Sales Employee creates a lead, the backend can associate the lead with the authenticated employee rather than relying solely on a client-provided owner value.

This allows ownership and access control to be enforced at the API level.

---

# Property Management

Properties are represented using a hierarchical structure:

```text
Project
   ↓
Building
   ↓
Unit
```

Example:

```text
Green Valley Residency
        ↓
      Block A
        ↓
 ┌──────┼──────┐
A-101  A-102  A-103
```

The system supports:

* Projects
* Buildings
* Units
* Unit types
* Pricing
* Availability
* Property filtering

Supported unit types:

```text
1BHK
2BHK
3BHK
4BHK
VILLA
PLOT
```

Unit statuses:

```text
AVAILABLE
BOOKED
```

Property management operations are restricted according to the application's role permissions.

---

# Booking Management

A booking connects a lead with an available property unit.

```text
Lead
  +
Available Unit
      ↓
   Booking
      ↓
Unit → BOOKED
      ↓
Lead → Booked
```

When a booking is successfully created:

1. The booking is stored in the database.
2. The associated unit is marked as `BOOKED`.
3. The associated lead moves to the `Booked` stage.

This keeps the lead and property inventory state synchronized.

---

# Duplicate Booking Protection

Preventing multiple bookings for the same unit is an important business requirement.

The application uses multiple layers of protection.

### Backend Validation

Before creating a booking, the backend verifies that the selected unit is available.

### Database Constraint

The booking relationship enforces uniqueness for the unit:

```sql
UNIQUE(unit_id)
```

This provides database-level protection against multiple booking records for the same unit.

### Transaction Handling

The booking operation uses database transaction handling to maintain consistency when the booking modifies multiple related records.

Conceptually:

```text
Request A ──────┐
                ↓
             Unit A-101
                ↑
Request B ──────┘

Only one booking should succeed.
```

The database therefore acts as the final integrity layer rather than relying exclusively on frontend validation.

---

# Dashboard

The dashboard provides an overview of CRM activity, including:

* Total leads
* Follow-ups
* Bookings
* Sales activity information

Dashboard data is retrieved from the backend rather than being statically hardcoded in the frontend.

---

# User Roles & Permissions

## Admin

Administrators can:

* View and manage leads
* Assign leads to Sales Employees
* Manage employees
* Create and manage projects
* Create and manage buildings
* Create and manage units
* View bookings
* Access administrative functionality

---

## Sales Employee

Sales Employees can:

* View assigned leads
* Create and manage leads
* Add lead notes
* Manage follow-ups
* View property inventory
* Create bookings
* View bookings

Sales Employees cannot access functionality restricted to administrators.

Lead ownership is also enforced at the backend level so that employees cannot access leads belonging to other employees.

---


## Core Tables

```text
users
leads
lead_notes
projects
buildings
units
bookings
```

# Testing

The application was tested across authentication, authorization, lead management, property management, booking workflows, and frontend/backend integration.

## Authentication Testing

* Admin login
* Sales Employee login
* Invalid credentials
* Logout
* Protected routes
* Session persistence

## Authorization Testing

* Admin permissions
* Sales Employee permissions
* Admin-only employee management
* Admin-only property management
* Lead ownership restrictions
* Unauthorized API access

## Lead Testing

* Lead creation
* Lead assignment
* Lead visibility
* Lead details
* Lead editing
* Lead notes
* Follow-up information
* Lead stage updates

## Property Testing

* Project creation
* Building creation
* Unit creation
* Unit availability
* Property visibility
* Property hierarchy relationships

## Booking Testing

* Booking creation
* Booking retrieval
* Unit status update
* Lead stage update
* Duplicate booking prevention
* Booking validation

## Dashboard Testing

* Lead count
* Booking count
* Follow-up information
* Backend data synchronization

## Final Validation

* Page refresh
* Logout behavior
* Protected routes after logout
* Authentication persistence
* Browser console errors
* Backend errors
* API responses through Swagger/Postman

