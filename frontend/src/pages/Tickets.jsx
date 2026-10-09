import { useEffect, useState } from "react";
import api from "../api/axios";
import TicketCard from "../components/TicketCard";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const [ticketsResponse, bookingsResponse, eventsResponse] =
          await Promise.all([
            api.get("/tickets/"),
            api.get("/bookings/"),
            api.get("/events/"),
          ]);

        setTickets(ticketsResponse.data);
        setBookings(bookingsResponse.data);
        setEvents(eventsResponse.data);
      } catch (err) {
        setError("Unable to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <main className="tickets-page">
        <p className="status-message">Loading tickets...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="tickets-page">
        <p className="error-message page-message">{error}</p>
      </main>
    );
  }

  return (
    <main className="tickets-page">
      <div className="page-header">
        <h1>My Tickets</h1>
        <p>Your confirmed event tickets and QR codes.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎟️</div>
          <h2>No tickets yet</h2>
          <p>
            Your confirmed event tickets will appear here after
            you make a booking.
          </p>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket, index) => {
            const booking = bookings.find(
              (booking) => booking.id === ticket.booking_id
            );

            const event = booking
              ? events.find(
                  (event) => event.id === booking.event_id
                )
              : null;

            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                displayNumber={index + 1}
                eventName={
                  event ? event.title : "Event unavailable"
                }
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Tickets;