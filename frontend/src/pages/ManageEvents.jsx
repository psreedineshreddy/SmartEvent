import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setError("");
      const response = await api.get("/events/organizer/my-events");
      setEvents(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load your events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCancel = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this event?")) {
      return;
    }

    try {
      await api.patch(`/events/${eventId}/cancel`);
      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to cancel event."
      );
    }
  };

  if (loading) {
    return (
      <main className="manage-events-page">
        <p className="manage-events-message">Loading your events...</p>
      </main>
    );
  }

  return (
    <main className="manage-events-page">
      <div className="manage-events-header">
        <div>
          <span className="dashboard-eyebrow">ORGANIZER PORTAL</span>
          <h1>My Events</h1>
          <p>Manage your events, details, and availability.</p>
        </div>

        <button onClick={() => navigate("/organizer/create-event")}>
          + Create Event
        </button>
      </div>

      {error && <p className="manage-events-error">{error}</p>}

      <div className="manage-events-toolbar">
        <h2>Your Events</h2>
        <span>
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="manage-events-empty">
          <span>📅</span>
          <h2>No events yet</h2>
          <p>Create an event to start managing your event listings.</p>
          <button onClick={() => navigate("/organizer/create-event")}>
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="manage-events-grid">
          {events.map((event) => (
            <article className="manage-event-card" key={event.id}>
              <div className="manage-event-card-top">
                <div className="manage-event-heading">
                  <span className="manage-event-category">
                    {event.category || "General"}
                  </span>
                  <h2>{event.title}</h2>
                </div>

                <span
                  className={`event-status-badge ${(event.event_status || "upcoming").toLowerCase()}`}
                >
                  {event.event_status || "Unknown"}
                </span>
              </div>

              <div className="manage-event-details">
                <div>
                  <span>📍 Location</span>
                  <strong>{event.location}</strong>
                </div>
                <div>
                  <span>🎟️ Available Tickets</span>
                  <strong>{event.available_tickets}</strong>
                </div>
                <div>
                  <span>💰 Ticket Price</span>
                  <strong>₹{Number(event.ticket_price).toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span>📅 Event Date</span>
                  <strong>
                    {event.event_date
                      ? new Date(event.event_date).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="manage-event-actions">
                <button
                  className="manage-edit-button"
                  onClick={() =>
                    navigate(`/organizer/events/edit/${event.id}`)
                  }
                >
                  Edit Event
                </button>

                {event.event_status !== "CANCELLED" &&
                  event.event_status !== "COMPLETED" && (
                    <button
                      className="manage-cancel-button"
                      onClick={() => handleCancel(event.id)}
                    >
                      Cancel Event
                    </button>
                  )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default ManageEvents;