
import { Link } from "react-router-dom";
import { useState } from "react";

const categoryFallbacks = {
  Music:
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80",
  Tech:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
  Business:
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
  "Art & Culture":
    "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=80",
};

const defaultFallback =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80";

function EventCard({ event }) {
  const [imageSrc, setImageSrc] = useState(
    event.banner_image || categoryFallbacks[event.category] || defaultFallback
  );
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const status = event.event_status || "UPCOMING";
  const statusClass = status.toLowerCase();

  const handleImageError = () => {
    if (!fallbackUsed) {
      setFallbackUsed(true);
      setImageSrc(categoryFallbacks[event.category] || defaultFallback);
    } else if (imageSrc !== defaultFallback) {
      setImageSrc(defaultFallback);
    }
  };

  return (
    <article className="event-card">
      <div className="event-card-image-wrapper">
        <img
          className="event-card-image"
          src={imageSrc}
          alt={event.title}
          loading="lazy"
          onError={handleImageError}
        />

        <span className="event-category">{event.category}</span>

        <span className={`event-status-badge ${statusClass}`}>
          {status}
        </span>
      </div>

      <div className="event-card-content">
        <h2>{event.title}</h2>

        <p className="event-description">{event.description}</p>

        <div className="event-details">
          <p className="event-info">📍 {event.location}</p>
          <p className="event-info">
            📅 {new Date(event.event_date).toLocaleDateString()}
          </p>
        </div>

        <div className="event-card-footer">
          <strong>₹{event.ticket_price}</strong>

          <Link to={`/events/${event.id}`} className="view-button">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;
