# SmartEvent – Event Discovery & Ticket Booking System

SmartEvent is a full-stack event discovery and ticket booking application built using FastAPI, SQLite, React, and JWT authentication.

## Features

- User registration and login
- JWT-based authentication
- Protected routes
- Event listing and event details
- Event search and category filtering
- Ticket booking with quantity selection
- Ticket availability validation
- Booking history
- Unique ticket codes
- QR code generation and verification
- Booking notifications
- Event reminders
- Responsive React interface

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
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
│
├── Screenshots/
│
└── README.md


## Backend Setup

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend API:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs

## Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

## Event Images

Event images are stored in:

backend/static/event_images/

## Notes

The .env file contains the JWT secret and is excluded from Git using .gitignore.
