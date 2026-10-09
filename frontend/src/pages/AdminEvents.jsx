import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/admin/events");
        setEvents(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatEventDateTime = (event) => {
    const dateTime = event.event_date;

    if (!dateTime) return "Date and time not specified";

    const parsedDate = new Date(dateTime);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date and time not specified";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <main className="admin-events-page">
      <header className="admin-events-header">
        <div>
          <span className="admin-dashboard-eyebrow">
            ADMINISTRATION
          </span>
          <h1>Events</h1>
          <p>Review events and their current platform status.</p>
        </div>

        <span className="admin-events-count">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </header>

      {loading ? (
        <p className="admin-events-message">Loading events...</p>
      ) : error ? (
        <p className="admin-events-error">{error}</p>
      ) : events.length === 0 ? (
        <div className="admin-events-empty">
          <span>📅</span>
          <h2>No events found</h2>
          <p>Events will appear here when they are created.</p>
        </div>
      ) : (
        <section className="admin-events-grid">
          {events.map((event) => (
            <article className="admin-event-card" key={event.id}>
              <div className="admin-event-card-top">
                <span className="admin-event-category">
                  {event.category || "General"}
                </span>

                <span
                  className={`admin-event-status ${(event.event_status || "unknown").toLowerCase()}`}
                >
                  {event.event_status || "Unknown"}
                </span>
              </div>

              <h2>{event.title}</h2>

              <div className="admin-event-meta">
                <span>
                  📍 {event.location || "Location not specified"}
                </span>
                <span>📅 {formatEventDateTime(event)}</span>
              </div>

              <div className="admin-event-details">
                <div>
                  <span>Ticket Price</span>
                  <strong>
                    ₹{Number(event.ticket_price || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div>
                  <span>Available Tickets</span>
                  <strong>{event.available_tickets ?? 0}</strong>
                </div>
              </div>

              <div className="admin-event-footer">
                <span>Organizer ID</span>
                <strong>{event.organizer_id ?? "Not assigned"}</strong>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminEvents;