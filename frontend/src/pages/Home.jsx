
import { useEffect, useState } from "react";
import api from "../api/axios";
import EventCard from "../components/EventCard";

function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          search: search || undefined,
          category: category || undefined,
          start_date: startDate
            ? `${startDate}T00:00:00`
            : undefined,
          end_date: endDate
            ? `${endDate}T23:59:59`
            : undefined,
          sort_by: sortBy,
        };

        const response = await api.get("/events/", { params });
        setEvents(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, category, startDate, endDate, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
  };

  const upcomingEvents = events
    .filter((event) => {
      const status = (event.event_status || "UPCOMING").toUpperCase();
      return status === "UPCOMING" || status === "ONGOING";
    })
    .slice(0, 5);

  const popularCategories = [
    { name: "Music", icon: "♫", color: "music" },
    { name: "Tech", icon: "⌘", color: "tech" },
    { name: "Sports", icon: "⚽", color: "sports" },
    { name: "Business", icon: "▤", color: "business" },
  ];

  return (
    <main className="home-page">
      <div className="home-layout">
        <div className="home-main-column">
          <section className="home-hero">
            <div className="hero-copy">
              <span className="hero-label">YOUR NEXT EXPERIENCE STARTS HERE</span>
              <h1>
                Discover Events.
                <br />
                <span>Make Memories.</span>
              </h1>
              <p>
                From live music to inspiring conferences, find experiences
                worth looking forward to.
              </p>
              
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
              <div className="hero-photo">
                <img
                  src="https://media.istockphoto.com/id/2219625374/photo/group-of-multiracial-friends-enjoying-on-outdoor-festival-or-concert-visiting-music-event.jpg?s=612x612&w=0&k=20&c=M1JFaCvROrCqEp4Pjhdp8FevUFqfhXKHij3WJcDyuk4="
                  alt=""
                />
              </div>
              <span className="hero-floating-note">Good times<br />ahead ✦</span>
              <span className="hero-sparkle sparkle-one">✦</span>
              <span className="hero-sparkle sparkle-two">♫</span>
            </div>
          </section>

          <section className="events-section" id="featured-events">
            <div className="event-section-heading">
              <div>
              
                <h2>Featured Events</h2>
                <p>Explore something exciting happening near you.</p>
              </div>
              <span className="event-count">
                {loading ? "Loading…" : `${events.length} events`}
              </span>
            </div>

            <div className="event-filters">
              <div className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  type="text"
                  placeholder="Search events..."
                  aria-label="Search events"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="category-box">
                <select
                  aria-label="Filter by category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Music">Music</option>
                  <option value="Tech">Tech</option>
                  <option value="Sports">Sports</option>
                  <option value="Business">Business</option>
                  <option value="Art & Culture">Art & Culture</option>
                </select>
              </div>

              <div className="date-filter">
                {!startDate && <span className="date-placeholder">Start date</span>}
                <input
                  id="start-date"
                  aria-label="Start date"
                  className={startDate ? "date-input has-value" : "date-input"}
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="date-filter">
                {!endDate && <span className="date-placeholder">End date</span>}
                <input
                  id="end-date"
                  aria-label="End date"
                  className={endDate ? "date-input has-value" : "date-input"}
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="category-box sort-box">
                <select
                  id="sort-events"
                  aria-label="Sort events"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Earliest First</option>
                  <option value="date_desc">Latest First</option>
                  <option value="popularity">Popularity</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>

            {loading && <p className="status-message">Loading events...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && events.length === 0 && (
              <p className="status-message">No events found. Try changing your filters.</p>
            )}

            {!loading && !error && events.length > 0 && (
              <div className="event-grid">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="home-sidebar">
          <section className="sidebar-panel">
            <div className="sidebar-heading">
              <h2>Upcoming Events</h2>
              <span aria-hidden="true">↗</span>
            </div>

            {loading && <p className="sidebar-empty">Finding events...</p>}

            {!loading && !error && upcomingEvents.length === 0 && (
              <p className="sidebar-empty">No upcoming events found.</p>
            )}

            {!loading && !error && upcomingEvents.map((event) => (
              <a
                className="upcoming-event"
                href={`/events/${event.id}`}
                key={event.id}
              >
                <img
                  src={event.banner_image}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=160&q=75";
                  }}
                />
                <span className="upcoming-event-copy">
                  <strong>{event.title}</strong>
                  <small>
                    {new Date(event.event_date).toLocaleDateString()}
                  </small>
                  <small>{event.location}</small>
                </span>
              </a>
            ))}
          </section>

          <section className="sidebar-promo">
            <span className="promo-icon" aria-hidden="true">✦</span>
            <span className="section-eyebrow">MAKE IT MEMORABLE</span>
            <h2>Your next great experience awaits.</h2>
            <p>Discover events, book your tickets, and make every moment count.</p>
            <a href="#featured-events">Find your event →</a>
          </section>

        
          <section className="sidebar-panel popular-panel">
            <div className="sidebar-heading">
              <h2>Popular Categories</h2>
            </div>

            <div className="popular-categories">
              {popularCategories.map((item) => (
                <button
                  type="button"
                  className="popular-category"
                  key={item.name}
                  onClick={() => {
                    setCategory(item.name);
                    document.getElementById("featured-events")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <span className={`category-icon ${item.color}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-panel experience-panel">
            <div className="sidebar-heading">
              <h2>Plan Your Experience</h2>
              <span aria-hidden="true">✦</span>
            </div>

            <div className="experience-tip">
              <span className="experience-icon">🎟️</span>
              <div>
                <h3>Easy Booking</h3>
                <p>Book your favourite events in just a few clicks.</p>
              </div>
            </div>

            <div className="experience-tip">
              <span className="experience-icon">🔔</span>
              <div>
                <h3>Stay Updated</h3>
                <p>Keep track of bookings and event reminders.</p>
              </div>
            </div>

            <div className="experience-tip">
              <span className="experience-icon">✨</span>
              <div>
                <h3>Discover More</h3>
                <p>Explore new experiences across different categories.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}   
export default Home;
