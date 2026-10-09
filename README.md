# SmartEvent – Event Discovery & Ticket Booking System

SmartEvent is a full-stack event discovery and ticket booking application built using FastAPI, SQLite, React, and JWT authentication.

## Features

### Authentication and Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (User, Organizer, and Admin)
- Protected routes

### Event Management
- Event listing and event details
- Event search and category filtering
- Organizer event creation, editing, and management
- Event booking overview
- Event status updates and cancellation notices

### Booking and Tickets
- Ticket booking with quantity selection
- Ticket availability validation
- Booking history
- Unique ticket codes
- QR code generation and verification
- Booking confirmation notifications

### Notifications and Insights
- Booking notifications
- Event cancellation and update notifications
- Event reminders
- Organizer insights and revenue statistics

### Admin Dashboard
- Platform dashboard
- Platform analytics
- Top events overview
- Date-based filtering
- Users, events, and bookings overview

### User Interface
- Responsive React interface
- Role-specific navigation
- Event status badges

## Technologies

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT
- bcrypt
- Pydantic
- APScheduler
- QRCode

### Frontend
- React
- React Router
- Axios
- Vite
- CSS

## Project Structure
## Project Structure

```text
SmartEvent/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   └── services/
│   ├── static/
│   │   ├── event_images/
│   │   └── qr_codes/
│   ├── requirements.txt
│   ├── seed.py
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── Screenshots Phase 1/
├── Phase 2 Screenshots/
└── README.md
```

## Backend Setup

Open a terminal and run:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend API: http://127.0.0.1:8000

Swagger documentation: http://127.0.0.1:8000/docs

## Frontend Setup

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Screenshots

Phase 2 screenshots are stored in the `Phase2_Screenshots/` directory.

## Event Images

Event images are stored in:

```text
backend/static/event_images/
```

## Notes

- The `.env` file contains the JWT secret and other environment settings. It should be excluded from Git using `.gitignore`.
- Do not commit secrets, virtual environments, or generated cache files.
