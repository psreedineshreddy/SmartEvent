
import { useEffect, useState } from "react";
import api from "../api/axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        setUsers(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <main className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <span className="admin-dashboard-eyebrow">
            ADMINISTRATION
          </span>
          <h1>Users</h1>
          <p>View registered users and their platform roles.</p>
        </div>

        <span className="admin-users-count">
          {users.length} {users.length === 1 ? "user" : "users"}
        </span>
      </header>

      {loading ? (
        <p className="admin-users-message">Loading users...</p>
      ) : error ? (
        <p className="admin-users-error">{error}</p>
      ) : users.length === 0 ? (
        <div className="admin-users-empty">
          <span>👥</span>
          <h2>No users found</h2>
          <p>Registered users will appear here.</p>
        </div>
      ) : (
        <section className="admin-users-grid">
          {users.map((user) => (
            <article className="admin-user-card" key={user.id}>
              <div className="admin-user-card-header">
                <div className="admin-user-avatar">
                  {(user.username || "?").charAt(0).toUpperCase()}
                </div>

                <span
                  className={`admin-user-role ${(user.role || "user").toLowerCase()}`}
                >
                  {user.role}
                </span>
              </div>

              <h2>{user.username}</h2>
              <p className="admin-user-email">{user.email}</p>

              <div className="admin-user-card-footer">
                <span>User ID</span>
                <strong>#{user.id}</strong>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminUsers;
