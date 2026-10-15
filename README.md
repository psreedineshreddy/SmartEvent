# SmartEvent – Event Discovery & Ticket Booking System

SmartEvent is a full-stack event discovery and ticket-booking application built with FastAPI, React, SQLite, and JWT authentication. It supports attendees, organizers, and administrators, along with event booking, simulated payments, event updates, and personalized discovery features.

## Features

### 1. Accounts and Access

- User registration and login with JWT authentication.
- Role-based access for USER, ORGANIZER, and ADMIN.
- User profile and booking summary.
- Protected routes and role-specific navigation.

### 2. Events and Discovery

- Browse and search events.
- Filter by category, location, event date range, and ticket-price range.
- Sort by date, price, or popularity.
- Personalized recommendations based on viewed events and confirmed bookings.
- Recommended and trending event sections.
- Live ticket availability using WebSockets.
- Event status updates and organizer-posted announcements.

### 3. Booking and Tickets

- Ticket quantity selection and availability checks.
- Booking history and confirmation.
- Unique ticket codes and QR-code support.
- Booking notifications and event reminders.

### 4. Payments and Coupons

- Payment checkout and payment records.
- Simulated payment flow with transaction references.
- Coupon validation and discount calculation.
- Payment result and history pages.

**Note:** The payment service uses simulation. It is not a live payment gateway.

### 5. Reviews, Wishlist, and Chatbot

- Event reviews and 1–5-star ratings.
- Save and remove events from a wishlist.
- AI chatbot for event discovery and booking-related help.
- Chatbot suggestions and context from upcoming events and the signed-in user's bookings.
- Gemini API configuration for chatbot functionality.

### 6. Organizer and Admin Tools

- Organizers can create and manage their events.
- Organizers can view bookings for their events.
- Admin pages for users, events, bookings, and platform analytics.
- Notifications for bookings and event updates.

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT authentication
- APScheduler
- QRCode
- WebSockets
- Google GenAI SDK

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
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   ├── static/
│   │   ├── event_images/
│   │   └── qr_codes/
│   ├── requirements.txt
│   └── seed.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── Phase 1-3 screenshots/
├── Phase 4 Screenshots/
└── README.md
```

## Setup and Installation

### 1. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd ~/Downloads/SmartEvent/backend
```

Create and activate a Python virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `backend/.env` file and configure the required environment variables. Set a strong `SECRET_KEY` and configure `GEMINI_API_KEY` if you want to use the AI chatbot.

**Never share or commit real API keys or secrets.**

Start the backend:

```bash
uvicorn app.main:app --reload
```

- Backend API:** http://127.0.0.1:8000
- Swagger API documentation:** http://127.0.0.1:8000/docs

### 2. Frontend Setup

Open a second terminal:

```bash
cd ~/Downloads/SmartEvent/frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

### Live Ticket Availability

The WebSocket endpoint for event ticket availability is:

```text
ws://127.0.0.1:8000/ws/events/{event_id}/availability
```

Replace `{event_id}` with the event ID you want to monitor.

## Screenshots

- `Phase 1-3 screenshots/` – Screenshots from the earlier project phases.
- `Phase 4 Screenshots/` – Screenshots covering live ticket availability, recommendations, wishlist actions, event updates, profile summary, advanced search filters, chatbot responses, and Swagger APIs.

## Security and Local Development

- Keep `.env` files and API keys out of version control and shared archives.
- Do not distribute local SQLite databases or backups that may contain account and booking data.
- Exclude `venv/`, `node_modules/`, `dist/`, and `__pycache__/` from source submissions.
- The backend uses SQLite for local development. Database tables are initialized by the application.
- Configure CORS appropriately if the frontend runs on a different origin.
- Use a strong, private JWT secret and never expose authentication tokens.
- The simulated payment service does not process real payments.

## Development Notes

Run the backend and frontend in separate terminals during local development. Configure the backend environment variables before starting the application. Refer to `/docs` to inspect available API operations.
