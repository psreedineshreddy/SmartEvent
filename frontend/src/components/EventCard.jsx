
import { Link } from "react-router-dom";

function EventCard({ event }) {
  const status = event.event_status || "UPCOMING";

  const statusClass = status.toLowerCase();

  return (
    <article className="event-card">
      <div className="event-card-image-wrapper">
        <img
          className="event-card-image"
          src={event.banner_image}
          alt={event.title}
        />

        <span className="event-category">
          {event.category}
        </span>

        <span className={`event-status-badge ${statusClass}`}>
          {status}
        </span>
      </div>

      <div className="event-card-content">
        <h2>{event.title}</h2>

        <p className="event-description">
          {event.description}
        </p>

        <div className="event-details">
          <p className="event-info">
            📍 {event.location}
          </p>

          <p className="event-info">
            📅 {new Date(event.event_date).toLocaleDateString()}
          </p>
        </div>

        <div className="event-card-footer">
          <strong>₹{event.ticket_price}</strong>

          <Link
            to={`/events/${event.id}`}
            className="view-button"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
