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
    <main className="page-container">
      <div className="page-header">
        <h1>Discover Events</h1>
        <p>Find exciting events and book your tickets.</p>
      </div>

      <div className="event-filters">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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
    </main>
  );
}

export default Home;