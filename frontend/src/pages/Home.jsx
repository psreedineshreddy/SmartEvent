import { useEffect, useState } from "react";
import api from "../api/axios";
import EventCard from "../components/EventCard";

function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/events/", {
          params: {
            search: search || undefined,
            category: category || undefined,
          },
        });

        setEvents(response.data);
      } catch (err) {
        setError("Unable to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, category]);

  return (
    <main className="home-page">
      <section className="home-hero">
        <div>
          <span className="hero-label">SMARTEVENT</span>

          <h1>Discover Events You'll Love</h1>

          <p>
            Explore exciting events, find your favorites, and book your
            tickets with ease.
          </p>
        </div>
      </section>

      <section className="events-section">
        <div className="page-header">
          <h2>Explore Events</h2>
          <p>Find the perfect event for you.</p>
        </div>

        <div className="event-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-box">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Tech">Tech</option>
              <option value="Sports">Sports</option>
              <option value="Business">Business</option>
            </select>
          </div>
        </div>

        {loading && <p className="status-message">Loading events...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p className="status-message">No events found.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;