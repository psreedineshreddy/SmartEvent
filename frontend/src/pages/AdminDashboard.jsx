
import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get("/admin/overview");
        setOverview(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load admin dashboard."
        );
      }
    };

    fetchOverview();
  }, []);

  if (error) {
    return (
      <main className="admin-dashboard">
        <p className="admin-dashboard-error">{error}</p>
      </main>
    );
  }

  if (!overview) {
    return (
      <main className="admin-dashboard">
        <p className="admin-dashboard-message">
          Loading dashboard...
        </p>
      </main>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: overview.total_users,
      icon: "👥",
      style: "users",
    },
    {
      title: "Total Events",
      value: overview.total_events,
      icon: "📅",
      style: "events",
    },
    {
      title: "Total Bookings",
      value: overview.total_bookings,
      icon: "🎟️",
      style: "bookings",
    },
    {
      title: "Tickets Sold",
      value: overview.total_tickets_sold,
      icon: "🎫",
      style: "tickets",
    },
    {
      title: "Total Revenue",
      value: `₹${Number(overview.total_revenue).toLocaleString("en-IN")}`,
      icon: "₹",
      style: "revenue",
    },
  ];

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <span className="admin-dashboard-eyebrow">
          ADMINISTRATION
        </span>
        <h1>Admin Dashboard</h1>
        <p>Overview of SmartEvent platform activity.</p>
      </header>

      <section className="admin-stats-grid">
        {stats.map((stat) => (
          <article
            className="admin-stat-card"
            key={stat.title}
          >
            <div className="admin-stat-card-top">
              <span>{stat.title}</span>
              <span
                className={`admin-stat-icon ${stat.style}`}
              >
                {stat.icon}
              </span>
            </div>
            <h2>{stat.value}</h2>
            <p>Platform overview</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AdminDashboard;
