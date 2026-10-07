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
    return <p className="status-message">Loading tickets...</p>;
  }

  if (error) {
    return <p className="error-message page-message">{error}</p>;
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>My Tickets</h1>
        <p>Your confirmed event tickets and QR codes.</p>
      </div>

      {tickets.length === 0 ? (
        <p className="status-message">No tickets found.</p>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => {
            const booking = bookings.find(
              (booking) => booking.id === ticket.booking_id
            );

            const event = booking
              ? events.find((event) => event.id === booking.event_id)
              : null;

            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                eventName={event ? event.title : "Event unavailable"}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Tickets;