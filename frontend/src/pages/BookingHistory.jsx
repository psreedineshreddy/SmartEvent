import { useEffect, useState } from "react";
import api from "../api/axios";

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, eventsResponse] = await Promise.all([
          api.get("/bookings/"),
          api.get("/events/"),
        ]);

        setBookings(bookingsResponse.data);
        setEvents(eventsResponse.data);
      } catch (err) {
        setError("Unable to load booking history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="page-container">
        <p className="status-message">Loading booking history...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <p className="error-message page-message">{error}</p>
      </main>
    );
  }

  return (
    <main className="booking-history-page">
      <div className="page-header">
        <h1>My Booking History</h1>
        <p>View and manage your event bookings.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h2>No bookings yet</h2>
          <p>
            You haven't booked any events yet. Explore events and
            find something you like.
          </p>
        </div>
      ) : (
        <div className="booking-history-grid">
          {bookings.map((booking, index) => {
            const event = events.find(
              (event) => event.id === booking.event_id
            );

            return (
              <article
                className="booking-history-card"
                key={booking.id}
              >
                <div className="booking-card-header">
                  <div>
                    <span className="booking-label">
                      Booking
                    </span>
                    <h2>#{index + 1}</h2>
                  </div>

                  <span
                    className={`booking-status ${booking.booking_status.toLowerCase()}`}
                  >
                    {booking.booking_status}
                  </span>
                </div>

                <div className="booking-event-name">
                  <span>Event</span>
                  <strong>
                    {event
                      ? event.title
                      : `Event #${booking.event_id}`}
                  </strong>
                </div>

                <div className="booking-card-details">
                  <div>
                    <span>Tickets</span>
                    <strong>{booking.ticket_quantity}</strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>₹{booking.total_price}</strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default BookingHistory;