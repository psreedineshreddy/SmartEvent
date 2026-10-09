import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminAnalytics() {
  const [popularEvents, setPopularEvents] = useState([]);
  const [topRevenueEvents, setTopRevenueEvents] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [monthlyBookings, setMonthlyBookings] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async (startDate = fromDate, endDate = toDate) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (startDate) params.from_date = startDate;
      if (endDate) params.to_date = endDate;

      const [
        popularResponse,
        revenueResponse,
        dailySalesResponse,
        monthlyBookingsResponse,
      ] = await Promise.all([
        api.get("/admin/analytics/popular-events", { params }),
        api.get("/admin/analytics/top-revenue-events", { params }),
        api.get("/admin/analytics/daily-ticket-sales", { params }),
        api.get("/admin/analytics/monthly-booking-trends", { params }),
      ]);

      setPopularEvents(popularResponse.data);
      setTopRevenueEvents(revenueResponse.data);
      setDailySales(dailySalesResponse.data);
      setMonthlyBookings(monthlyBookingsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    fetchAnalytics("", "");
  };

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

  const getBarWidth = (value, items, key) => {
    const maximum = Math.max(
      ...items.map((item) => Number(item[key] || 0)),
      1
    );

    return `${Math.max((Number(value || 0) / maximum) * 100, 3)}%`;
  };

  const totalTickets = dailySales.reduce(
    (sum, item) => sum + Number(item.tickets_sold || 0),
    0
  );

  const totalBookings = monthlyBookings.reduce(
    (sum, item) => sum + Number(item.bookings || 0),
    0
  );

  const totalRevenue = topRevenueEvents.reduce(
    (sum, event) => sum + Number(event.total_revenue || 0),
    0
  );

  return (
    <main className="admin-analytics-page">
      <header className="admin-analytics-header">
        <div>
          <span className="admin-dashboard-eyebrow">
            ADMINISTRATION
          </span>
          <h1>Analytics</h1>
          <p>Explore ticket sales, booking trends, and event performance.</p>
        </div>
      </header>

      <section className="admin-analytics-filter">
        <div className="admin-analytics-filter-heading">
          <div>
            <h2>Filter Analytics</h2>
            <p>Select a date range to review performance.</p>
          </div>
          <span className="admin-analytics-filter-icon">📅</span>
        </div>

        <div className="admin-analytics-filter-controls">
          <label>
            From Date
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>

          <label>
            To Date
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>

          <div className="admin-analytics-filter-actions">
            <button
              type="button"
              onClick={() => fetchAnalytics()}
              disabled={loading}
              className="admin-analytics-apply"
            >
              Apply Filter
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="admin-analytics-clear"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="admin-analytics-error">
          <strong>Unable to load analytics</strong>
          <p>{error}</p>
          <button type="button" onClick={() => fetchAnalytics()}>
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-analytics-loading">
          <span className="admin-analytics-spinner" />
          <p>Loading analytics...</p>
        </div>
      ) : !error ? (
        <>
          <section className="admin-analytics-stats">
            <article className="admin-analytics-stat-card">
              <div className="admin-analytics-stat-icon blue">🎟️</div>
              <span>Tickets Sold</span>
              <strong>{formatNumber(totalTickets)}</strong>
              <small>For the selected date range</small>
            </article>

            <article className="admin-analytics-stat-card">
              <div className="admin-analytics-stat-icon purple">📊</div>
              <span>Bookings</span>
              <strong>{formatNumber(totalBookings)}</strong>
              <small>Across returned monthly data</small>
            </article>

            <article className="admin-analytics-stat-card">
              <div className="admin-analytics-stat-icon green">₹</div>
              <span>Top Events Revenue</span>
              <strong>₹{formatCurrency(totalRevenue)}</strong>
              <small>Sum of returned top-revenue events</small>
            </article>

            <article className="admin-analytics-stat-card">
              <div className="admin-analytics-stat-icon orange">🏆</div>
              <span>Popular Events</span>
              <strong>{formatNumber(popularEvents.length)}</strong>
              <small>Events returned by analytics</small>
            </article>
          </section>

          <section className="admin-analytics-charts">
            <article className="admin-analytics-panel">
              <div className="admin-analytics-panel-heading">
                <div>
                  <h2>Daily Ticket Sales</h2>
                  <p>Tickets sold by date</p>
                </div>
                <span>📈</span>
              </div>

              {dailySales.length === 0 ? (
                <p className="admin-analytics-empty">No data available.</p>
              ) : (
                <div className="admin-analytics-bars">
                  {dailySales.map((item) => (
                    <div className="admin-analytics-bar-row" key={item.date}>
                      <span className="admin-analytics-bar-label">
                        {item.date}
                      </span>
                      <div className="admin-analytics-bar-track">
                        <div
                          className="admin-analytics-bar-fill blue-fill"
                          style={{
                            width: getBarWidth(
                              item.tickets_sold,
                              dailySales,
                              "tickets_sold"
                            ),
                          }}
                        />
                      </div>
                      <strong>{formatNumber(item.tickets_sold)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-analytics-panel">
              <div className="admin-analytics-panel-heading">
                <div>
                  <h2>Monthly Booking Trends</h2>
                  <p>Bookings by month</p>
                </div>
                <span>📅</span>
              </div>

              {monthlyBookings.length === 0 ? (
                <p className="admin-analytics-empty">No data available.</p>
              ) : (
                <div className="admin-analytics-bars">
                  {monthlyBookings.map((item) => (
                    <div className="admin-analytics-bar-row" key={item.month}>
                      <span className="admin-analytics-bar-label">
                        {item.month}
                      </span>
                      <div className="admin-analytics-bar-track">
                        <div
                          className="admin-analytics-bar-fill purple-fill"
                          style={{
                            width: getBarWidth(
                              item.bookings,
                              monthlyBookings,
                              "bookings"
                            ),
                          }}
                        />
                      </div>
                      <strong>{formatNumber(item.bookings)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="admin-analytics-rankings">
            <article className="admin-analytics-panel">
              <div className="admin-analytics-panel-heading">
                <div>
                  <h2>Popular Events</h2>
                  <p>Ranked by tickets sold</p>
                </div>
                <span>🔥</span>
              </div>

              {popularEvents.length === 0 ? (
                <p className="admin-analytics-empty">No data available.</p>
              ) : (
                <div className="admin-analytics-event-list">
                  {popularEvents.map((event, index) => (
                    <div
                      className="admin-analytics-event-row"
                      key={event.event_id}
                    >
                      <span className="admin-analytics-rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="admin-analytics-event-info">
                        <strong>{event.event_title}</strong>
                        <span>{formatNumber(event.tickets_sold)} tickets sold</span>
                      </div>
                      <span className="admin-analytics-event-value">
                        {formatNumber(event.tickets_sold)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-analytics-panel">
              <div className="admin-analytics-panel-heading">
                <div>
                  <h2>Top Revenue Events</h2>
                  <p>Ranked by total revenue</p>
                </div>
                <span>💰</span>
              </div>

              {topRevenueEvents.length === 0 ? (
                <p className="admin-analytics-empty">No data available.</p>
              ) : (
                <div className="admin-analytics-event-list">
                  {topRevenueEvents.map((event, index) => (
                    <div
                      className="admin-analytics-event-row"
                      key={event.event_id}
                    >
                      <span className="admin-analytics-rank revenue-rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="admin-analytics-event-info">
                        <strong>{event.event_title}</strong>
                        <span>Event ID: {event.event_id}</span>
                      </div>
                      <span className="admin-analytics-revenue">
                        ₹{formatCurrency(event.total_revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default AdminAnalytics;