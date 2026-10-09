import { useEffect, useState } from "react";
import api from "../api/axios";

function OrganizerDashboard() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get("/events/organizer/insights");
        setInsights(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load organizer dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <main className="organizer-dashboard">
        <p className="dashboard-message">Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="organizer-dashboard">
        <p className="dashboard-error">{error}</p>
      </main>
    );
  }

  const totals = insights.reduce(
    (summary, event) => ({
      tickets: summary.tickets + event.tickets_sold,
      remaining: summary.remaining + event.remaining_tickets,
      bookings: summary.bookings + event.booking_count,
      revenue: summary.revenue + event.total_revenue,
    }),
    { tickets: 0, remaining: 0, bookings: 0, revenue: 0 }
  );

  return (
    <main className="organizer-dashboard">
      <div className="organizer-page-header">
        <div>
          <span className="dashboard-eyebrow">ORGANIZER PORTAL</span>
          <h1>Organizer Dashboard</h1>
          <p>Track your event performance and booking insights.</p>
        </div>
      </div>

      <section className="organizer-summary-grid">
        <article className="organizer-summary-card">
          <span className="summary-icon tickets-icon">🎟️</span>
          <p>Tickets Sold</p>
          <h2>{totals.tickets}</h2>
        </article>

        <article className="organizer-summary-card">
          <span className="summary-icon remaining-icon">🎫</span>
          <p>Remaining Tickets</p>
          <h2>{totals.remaining}</h2>
        </article>

        <article className="organizer-summary-card">
          <span className="summary-icon bookings-icon">📋</span>
          <p>Total Bookings</p>
          <h2>{totals.bookings}</h2>
        </article>

        <article className="organizer-summary-card">
          <span className="summary-icon revenue-icon">₹</span>
          <p>Total Revenue</p>
          <h2>₹{totals.revenue.toLocaleString("en-IN")}</h2>
        </article>
      </section>

      <section className="organizer-events-section">
        <div className="organizer-section-header">
          <div>
            <h2>Your Events</h2>
            <p>Performance overview for each event.</p>
          </div>
          <span className="organizer-event-count">
            {insights.length} {insights.length === 1 ? "event" : "events"}
          </span>
        </div>

        {insights.length === 0 ? (
          <div className="organizer-empty-state">
            <span>📅</span>
            <h3>No events yet</h3>
            <p>Create your first event to see its performance here.</p>
          </div>
        ) : (
          <div className="organizer-events-grid">
            {insights.map((event) => (
              <article className="organizer-event-card" key={event.event_id}>
                <div className="organizer-event-card-header">
                  <h3>{event.event_title}</h3>
                  <span
                    className={`event-status-badge ${(event.event_status || "upcoming").toLowerCase()}`}
                  >
                    {event.event_status || "Unknown"}
                  </span>
                </div>

                <div className="organizer-event-metrics">
                  <div>
                    <span>Tickets Sold</span>
                    <strong>{event.tickets_sold}</strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong>{event.remaining_tickets}</strong>
                  </div>
                  <div>
                    <span>Bookings</span>
                    <strong>{event.booking_count}</strong>
                  </div>
                  <div>
                    <span>Revenue</span>
                    <strong>₹{event.total_revenue.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default OrganizerDashboard;