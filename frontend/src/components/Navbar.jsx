import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import api from "../api/axios";

function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [username, setUsername] = useState("");
  const profileRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    api.get("/users/profile")
      .then((response) => {
        if (!cancelled) {
          setUsername(response.data.username || "My Account");
        }
      })
      .catch((error) => {
        console.error("Unable to load profile name:", error);
        if (!cancelled) setUsername("My Account");
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || role !== "USER") {
      setWishlistCount(0);
      return;
    }

    let cancelled = false;

    const fetchWishlistCount = async () => {
      try {
        const response = await api.get("/wishlist/");
        const savedEvents = Array.isArray(response.data)
          ? response.data
          : [];

        if (!cancelled) setWishlistCount(savedEvents.length);
      } catch (error) {
        console.error("Unable to load wishlist count:", error);
      }
    };

    fetchWishlistCount();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, role]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  const homePath =
    role === "ORGANIZER"
      ? "/organizer"
      : role === "ADMIN"
        ? "/admin"
        : "/";

  return (
    <nav className="navbar">
      <Link to={homePath} className="navbar-brand">
        <img
          src="/smartevent-logo.png"
          alt="SmartEvent logo"
          className="brand-logo"
        />
      </Link>

      <div className="navbar-links">
        {role === "USER" && (
          <>
            <Link to="/">Events</Link>
            <Link to="/booking-history">My Bookings</Link>
            <Link to="/tickets">My Tickets</Link>
            <Link to="/payments">My Payments</Link>
            <Link to="/notifications">Notifications</Link>
            <NotificationDropdown />

            <Link
              to="/wishlist"
              className="wishlist-nav-link"
              title="Wish List"
              aria-label={`Wish List, ${wishlistCount} saved events`}
            >
              <span className="wishlist-nav-icon">
                ♡︎
                {wishlistCount > 0 && (
                  <span className="wishlist-nav-badge">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </span>
              <span className="wishlist-nav-label">Wish List</span>
            </Link>
          </>
        )}

        {role === "ORGANIZER" && (
          <>
            <Link to="/organizer">Dashboard</Link>
            <Link to="/organizer/events">My Events</Link>
            <Link to="/organizer/create-event">Create Event</Link>
            <Link to="/organizer/bookings">Event Bookings</Link>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/events">Events</Link>
            <Link to="/admin/bookings">Bookings</Link>
            <Link to="/admin/analytics">Analytics</Link>
          </>
        )}

        <div className="profile-menu" ref={profileRef}>
          <button
            type="button"
            className="profile-menu-trigger"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <span className="profile-menu-avatar">
              {username.charAt(0).toUpperCase() || "U"}
            </span>
            <span className="profile-menu-name">{username}</span>
            <span className="profile-menu-chevron">▾</span>
          </button>

          {profileOpen && (
            <div className="profile-menu-dropdown" role="menu">
              <div className="profile-menu-heading">
                <strong>{username}</strong>
                <span>{role}</span>
              </div>

              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <span>👤</span> My Profile
              </Link>
              <button
                type="button"
                role="menuitem"
                className="profile-menu-logout"
                onClick={handleLogout}
              >
                <span>↪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
