import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <div className="event-card">
      <img
        className="event-card-image"
        src={event.banner_image}
        alt={event.title}
      />

      <div className="event-card-content">
        <span className="event-category">
          {event.category}
        </span>

        <h2>{event.title}</h2>

        <p className="event-description">
          {event.description}
        </p>

        <p className="event-info">
          📍 {event.location}
        </p>

        <p className="event-info">
          📅 {new Date(event.event_date).toLocaleDateString()}
        </p>

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
    </div>
  );
}

export default EventCard;