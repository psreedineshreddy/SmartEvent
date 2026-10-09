import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const homePath =
    role === "ORGANIZER"
      ? "/organizer"
      : role === "ADMIN"
        ? "/admin"
        : "/";

  return (
    <nav className="navbar">
      <Link to={homePath} className="navbar-brand">
        <span className="brand-icon">S</span>
        <span>SmartEvent</span>
      </Link>

      <div className="navbar-links">
        {/* USER */}
        {role === "USER" && (
          <>
            <Link to="/">Events</Link>
            <Link to="/booking-history">My Bookings</Link>
            <Link to="/tickets">My Tickets</Link>
            <Link to="/notifications">Notifications</Link>
            <NotificationDropdown />
          </>
        )}

        {/* ORGANIZER */}
        {role === "ORGANIZER" && (
          <>
            <Link to="/organizer">Dashboard</Link>
            <Link to="/organizer/events">My Events</Link>
            <Link to="/organizer/create-event">Create Event</Link>
            <Link to="/organizer/bookings">Event Bookings</Link>
          </>
        )}

        {/* ADMIN */}
        {role === "ADMIN" && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/events">Events</Link>
            <Link to="/admin/bookings">Bookings</Link>
            <Link to="/admin/analytics">Analytics</Link>
          </>
        )}

        <span className="role-badge">
          {role}
        </span>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;