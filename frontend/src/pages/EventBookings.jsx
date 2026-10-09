import { useEffect, useState } from "react";
import api from "../api/axios";

function EventBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/organizer/my-bookings");
        setBookings(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load event bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <main className="event-bookings-page">
        <p className="dashboard-message">Loading bookings...</p>
      </main>
    );
  }

  return (
    <main className="event-bookings-page">
      <div className="event-bookings-header">
        <div>
          <span className="dashboard-eyebrow">ORGANIZER PORTAL</span>
          <h1>Event Bookings</h1>
          <p>Track ticket reservations and booking details for your events.</p>
        </div>
        <div className="booking-count-badge">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </div>
      </div>

      {error && <p className="manage-events-error">{error}</p>}

      {bookings.length === 0 ? (
        <div className="organizer-empty-state">
          <span>🎟️</span>
          <h2>No bookings yet</h2>
          <p>Bookings for your events will appear here.</p>
        </div>
      ) : (
        <div className="event-bookings-grid">
          {bookings.map((booking, index) => (
            <article className="event-booking-card" key={booking.id}>
              <div className="event-booking-card-header">
                <div>
                  <span className="booking-card-label">BOOKING REFERENCE</span>
                  <h2>#{index + 1}</h2>
                </div>
                <span
                  className={`booking-status ${(booking.booking_status || "pending").toLowerCase()}`}
                >
                  {booking.booking_status || "Unknown"}
                </span>
              </div>

              <div className="event-booking-details">
                <div>
                  <span>Event</span>
                  <strong>{booking.event_title || `Event #${booking.event_id}`}</strong>
                </div>
                <div>
                  <span>Tickets</span>
                  <strong>{booking.ticket_quantity}</strong>
                </div>
                <div>
                  <span>Total Amount</span>
                  <strong>₹{Number(booking.total_price || 0).toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default EventBookings;