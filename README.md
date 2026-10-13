# SmartEvent – Event Discovery & Ticket Booking System

SmartEvent is a full-stack event discovery and ticket booking application built using FastAPI, SQLite, React, and JWT authentication. It provides event discovery, secure authentication, ticket booking, payment handling, reviews, notifications, organizer tools, and an admin dashboard.

## Features

### Authentication and Authorization
- User registration and login
- JWT-based authentication
- Role-based access control: User, Organizer, and Admin
- Protected routes and role-specific navigation

### Event Management
- Browse event listings and view event details
- Search events and filter by category
- Organizer event creation, editing, and management
- Event status updates and cancellation notices
- Event organizer assignment

### Booking and Tickets
- Ticket booking with quantity selection
- Ticket availability validation
- Booking history
- Unique ticket codes
- QR code generation and verification
- Booking confirmation notifications

### Payments and Coupons
- Payment records and checkout flow
- Payment status and transaction details
- Coupon validation
- Discount calculation and application
- Payment result page

### Reviews and Ratings
- Attendee-based event reviews
- Ratings from 1 to 5
- Review submission and management
- Average event ratings and review counts

### Notifications and Insights
- Booking notifications
- Event cancellation and update notifications
- Event reminders
- Notification history and read status
- Organizer insights and revenue statistics

### Admin Dashboard
- Platform dashboard and analytics
- Top events overview
- Date-based filtering
- Users, events, and bookings overview

### User Interface
- Responsive React interface
- Role-specific navigation
- Event status badges
- Search, filtering, and sorting
- Loading and error handling
- Responsive layouts for different screen sizes

## Technologies

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT authentication
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
├── Modules 12-17 Screenshots/
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

Project screenshots are organized into the following directories:

- `Modules 12-17 Screenshots/` – screenshots for Modules 12–17

## Event Images

Event images are stored in:

```text
backend/static/event_images/
```

## Security Notes

- Keep `.env` out of Git because it contains the JWT secret and environment settings.
- Do not commit virtual environments, generated caches, or other unnecessary local files.
- Configure the required environment variables before starting the backend.
