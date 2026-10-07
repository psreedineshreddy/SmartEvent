import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        SmartEvent
      </Link>

      <div className="navbar-links">
        <Link to="/">Events</Link>
        <Link to="/booking-history">My Bookings</Link>
        <Link to="/tickets">My Tickets</Link>
        <Link to="/notifications">Notifications</Link>

        <NotificationDropdown />

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