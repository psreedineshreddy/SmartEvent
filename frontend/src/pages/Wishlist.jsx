import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Wishlist() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadWishlist = async () => {
      try {
        const response = await api.get("/wishlist/");

        if (!cancelled) {
          setEvents(Array.isArray(response.data) ? response.data : []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail || "Could not load your wishlist."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  const removeEvent = async (eventId) => {
    if (removingId !== null) return;

    setRemovingId(eventId);
    setError("");

    try {
      await api.delete(`/wishlist/${eventId}`);

      setEvents((current) =>
        current.filter((event) => Number(event.id) !== Number(eventId))
      );
    } catch (err) {
      setError(
        err.response?.data?.detail || "Could not remove this event."
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-loading">
          <span className="wishlist-loading-icon">♡</span>
          <p>Loading your saved events...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <header className="wishlist-header">
        <div>
          <span className="wishlist-eyebrow">YOUR COLLECTION</span>
          <h1>My Wishlist</h1>
          <p>Keep your favorite experiences close and plan what’s next.</p>
        </div>

        <div className="wishlist-count">
          <span className="wishlist-count-icon">♡</span>
          <div>
            <strong>{events.length}</strong>
            <span>
              {events.length === 1 ? "Saved event" : "Saved events"}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="wishlist-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <section className="wishlist-empty">
          <div className="wishlist-empty-icon">♡</div>
          <h2>Your next favorite event starts here</h2>
          <p>
            You haven’t saved any events yet. Explore what’s happening and add
            events you’d love to attend.
          </p>
          <Link to="/" className="wishlist-explore-button">
            Explore Events <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <section className="wishlist-grid" aria-label="Saved events">
          {events.map((event) => (
            <article className="wishlist-card" key={event.id}>
              <div className="wishlist-card-image-wrap">
                {event.banner_image ? (
                  <img
                    src={event.banner_image}
                    alt={event.title}
                    className="wishlist-card-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="wishlist-card-image-placeholder">
                    <span>✦</span>
                    <span>SmartEvent</span>
                  </div>
                )}

                <span className="wishlist-category">{event.category}</span>

                <span className="wishlist-heart" aria-label="Saved event">
                  ♥
                </span>
              </div>

              <div className="wishlist-card-body">
                <h2>{event.title}</h2>

                <p className="wishlist-location">
                  <span>📍</span>
                  {event.location}
                </p>

                <p className="wishlist-date">
                  <span>📅</span>
                  {event.event_date
                    ? new Date(event.event_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Date to be announced"}
                </p>

                <div className="wishlist-card-footer">
                  <div className="wishlist-price">
                    <span>Ticket from</span>
                    <strong>
                      ₹{Number(event.ticket_price).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="wishlist-remove-button"
                    onClick={() => removeEvent(event.id)}
                    disabled={removingId !== null}
                  >
                    {removingId === event.id ? "Removing..." : "Remove"}
                  </button>
                </div>

                <Link
                  to={`/events/${event.id}`}
                  className="wishlist-book-button"
                >
                  Book Now <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Wishlist;
