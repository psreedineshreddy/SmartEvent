import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Music",
    location: "",
    event_date: "",
    ticket_price: "",
    available_tickets: "",
    banner_image: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        const event = response.data;

        setFormData({
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          event_date: event.event_date.slice(0, 16),
          ticket_price: event.ticket_price,
          available_tickets: event.available_tickets,
          banner_image: event.banner_image || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load event."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/events/${eventId}`, {
        ...formData,
        ticket_price: Number(formData.ticket_price),
        available_tickets: Number(formData.available_tickets),
      });

      navigate("/organizer/events");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update event."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="event-form-page">
        <p className="dashboard-message">Loading event details...</p>
      </main>
    );
  }

  return (
    <main className="event-form-page">
      <div className="event-form-header">
        <span className="dashboard-eyebrow">ORGANIZER PORTAL</span>
        <h1>Edit Event</h1>
        <p>Update your event details and keep attendees informed.</p>
      </div>

      <section className="event-form-card">
        <div className="event-form-card-header">
          <div className="event-form-icon">✎</div>
          <div>
            <h2>Event Details</h2>
            <p>Make the necessary changes to your event below.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="event-form-group">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              name="title"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="event-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your event..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="event-form-row">
            <div className="event-form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Music">Music</option>
                <option value="Tech">Tech</option>
                <option value="Sports">Sports</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div className="event-form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                placeholder="Enter event location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="event-form-group">
            <label htmlFor="event_date">Event Date and Time</label>
            <input
              id="event_date"
              type="datetime-local"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="event-form-row">
            <div className="event-form-group">
              <label htmlFor="ticket_price">Ticket Price (₹)</label>
              <input
                id="ticket_price"
                type="number"
                name="ticket_price"
                value={formData.ticket_price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="event-form-group">
              <label htmlFor="available_tickets">Available Tickets</label>
              <input
                id="available_tickets"
                type="number"
                name="available_tickets"
                value={formData.available_tickets}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="event-form-group">
            <label htmlFor="banner_image">
              Banner Image URL <span>(Optional)</span>
            </label>
            <input
              id="banner_image"
              type="url"
              name="banner_image"
              placeholder="https://example.com/event-banner.jpg"
              value={formData.banner_image}
              onChange={handleChange}
            />
          </div>

          {error && <p className="event-form-error">{error}</p>}

          <div className="event-form-actions">
            <button
              type="button"
              className="event-form-cancel"
              onClick={() => navigate("/organizer/events")}
            >
              Back to My Events
            </button>

            <button
              type="submit"
              className="event-form-submit"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Update Event"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EditEvent;