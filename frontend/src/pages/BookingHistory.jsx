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
    return <p className="status-message">Loading booking history...</p>;
  }

  if (error) {
    return <p className="error-message page-message">{error}</p>;
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>My Booking History</h1>
        <p>View your previous event bookings.</p>
      </div>

      {bookings.length === 0 ? (
        <p className="status-message">No bookings found.</p>
      ) : (
        <div className="booking-history-grid">
          {bookings.map((booking) => {
            const event = events.find(
              (event) => event.id === booking.event_id
            );

            return (
              <div className="booking-history-card" key={booking.id}>
                <div className="booking-card-header">
                  <h2>Booking #{booking.id}</h2>

                  <span
                    className={`booking-status ${booking.booking_status.toLowerCase()}`}
                  >
                    {booking.booking_status}
                  </span>
                </div>

                <div className="booking-event-name">
                  <span>Event</span>
                  <strong>
                    {event ? event.title : `Event #${booking.event_id}`}
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
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default BookingHistory;