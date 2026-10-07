import { useEffect, useState } from "react";
import api from "../api/axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/");
      setNotifications(response.data);
    } catch (err) {
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      fetchNotifications();
    } catch (err) {
      setError("Unable to update notification.");
    }
  };

  if (loading) {
    return (
      <p className="status-message">
        Loading notifications...
      </p>
    );
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Stay updated with your bookings and events.</p>
      </div>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {notifications.length === 0 ? (
        <p className="status-message">
          No notifications found.
        </p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              className={`notification-card ${
                !notification.is_read ? "unread" : ""
              }`}
              key={notification.id}
            >
              <div className="notification-content">
                <div className="notification-title-row">
                  <h2>{notification.title}</h2>

                  {!notification.is_read && (
                    <span className="unread-badge">
                      New
                    </span>
                  )}
                </div>

                <p>{notification.message}</p>

                <span className="notification-meta">
                  {notification.type} ·{" "}
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </span>
              </div>

              {!notification.is_read && (
                <button
                  className="mark-read-button"
                  onClick={() =>
                    markAsRead(notification.id)
                  }
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Notifications;