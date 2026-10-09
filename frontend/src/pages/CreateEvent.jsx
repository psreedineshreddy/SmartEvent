import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Music",
    location: "",
    event_date: "",
    ticket_price: "",
    available_tickets: 100,
    banner_image: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/events/", {
        ...formData,
        ticket_price: Number(formData.ticket_price),
        available_tickets: Number(formData.available_tickets),
      });

      navigate("/organizer");
    
} catch (err) {
  const detail = err.response?.data?.detail;

  if (Array.isArray(detail)) {
    setError(detail.map((item) => item.msg).join(", "));
  } else if (typeof detail === "string") {
    setError(detail);
  } else {
    setError("Unable to create event.");
  }
} finally {

      setLoading(false);
    }
  };

  return (
    <main className="event-form-page">
      <div className="event-form-header">
        <span className="dashboard-eyebrow">ORGANIZER PORTAL</span>
        <h1>Create New Event</h1>
        <p>Bring people together by publishing your next event.</p>
      </div>

      <section className="event-form-card">
        <div className="event-form-card-header">
          <div className="event-form-icon">✦</div>
          <div>
            <h2>Event Details</h2>
            <p>Fill in the information below to create your event.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="event-form-group">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              name="title"
              placeholder="e.g. Hyderabad Music Festival"
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
              placeholder="Describe your event and what attendees can expect..."
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
                <option value="Art & Culture">Art & Culture</option>
              </select>
            </div>

            <div className="event-form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                placeholder="e.g. Hyderabad"
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
                placeholder="Enter ticket price"
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
                placeholder="Number of tickets"
                value={formData.available_tickets}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="event-form-group">
            <label htmlFor="banner_image">Banner Image URL <span>(Optional)</span></label>
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
              disabled={loading}
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateEvent;