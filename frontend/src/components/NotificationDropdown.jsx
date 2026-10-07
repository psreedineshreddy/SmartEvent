import { useEffect, useState } from "react";
import api from "../api/axios";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/");
      setNotifications(response.data);
    } catch (err) {
      console.error("Unable to load notifications.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      fetchNotifications();
    } catch (err) {
      console.error("Unable to mark notification as read.");
    }
  };

  return (
    <div className="notification-dropdown">
      <button
        className="notification-bell"
        onClick={() => setOpen(!open)}
        aria-label="Open notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-menu">
          {notifications.length === 0 ? (
            <p className="notification-empty">
              No notifications.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                className="dropdown-notification"
                key={notification.id}
              >
                <strong>{notification.title}</strong>

                <p>{notification.message}</p>

                {!notification.is_read && (
                  <button
                    className="dropdown-read-button"
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;