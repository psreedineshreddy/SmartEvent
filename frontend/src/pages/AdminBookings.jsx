import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/admin/bookings");
        setBookings(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <main className="admin-bookings-page">
      <header className="admin-bookings-header">
        <div>
          <span className="admin-dashboard-eyebrow">
            ADMINISTRATION
          </span>
          <h1>Bookings</h1>
          <p>View and review all event bookings on the platform.</p>
        </div>

        <span className="admin-bookings-count">
          {bookings.length}{" "}
          {bookings.length === 1 ? "booking" : "bookings"}
        </span>
      </header>

      {loading ? (
        <p className="admin-bookings-message">Loading bookings...</p>
      ) : error ? (
        <p className="admin-bookings-error">{error}</p>
      ) : bookings.length === 0 ? (
        <section className="admin-bookings-empty">
          <span>🎟️</span>
          <h2>No bookings found</h2>
          <p>Bookings will appear here when users book events.</p>
        </section>
      ) : (
        <section className="admin-bookings-grid">
          {bookings.map((booking, index) => {
            const status = (
              booking.booking_status || "unknown"
            ).toLowerCase();

            return (
              <article
                className="admin-booking-card"
                key={booking.id}
              >
                <div className="admin-booking-card-top">
                  <div>
                    <span className="admin-booking-label">
                      BOOKING REFERENCE
                    </span>
                    <h2>Booking #{index + 1}</h2>
                  </div>

                  <span
                    className={`admin-booking-status ${status}`}
                  >
                    {booking.booking_status || "Unknown"}
                  </span>
                </div>

                <div className="admin-booking-event">
                  <span className="admin-booking-icon">🎫</span>
                  <div>
                    <span>Event ID</span>
                    <strong>Event #{booking.event_id}</strong>
                  </div>
                </div>

                <div className="admin-booking-details">
                  <div>
                    <span>User ID</span>
                    <strong>{booking.user_id ?? "N/A"}</strong>
                  </div>

                  <div>
                    <span>Tickets</span>
                    <strong>{booking.ticket_quantity ?? 0}</strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong className="admin-booking-amount">
                      ₹{formatAmount(booking.total_price)}
                    </strong>
                  </div>
                </div>

                <div className="admin-booking-footer">
                  <span>📅 {formatDate(booking.created_at)}</span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default AdminBookings;