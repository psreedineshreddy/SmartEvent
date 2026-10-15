import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Profile.css";

const initialProfile = {
  username: "",
  email: "",
  profile_image: "",
  role: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  city: "",
  state: "",
};

function Profile() {
  const [profile, setProfile] = useState(initialProfile);

  const [activity, setActivity] = useState({
    summary: {
      total_bookings: 0,
      total_tickets: 0,
      total_spent: 0,
    },
    bookings: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileResponse, activityResponse] = await Promise.all([
          api.get("/users/profile"),
          api.get("/users/profile/activity"),
        ]);

        setProfile({
          ...initialProfile,
          ...profileResponse.data,
          profile_image: profileResponse.data.profile_image || "",
          phone: profileResponse.data.phone || "",
          date_of_birth: profileResponse.data.date_of_birth || "",
          gender: profileResponse.data.gender || "",
          city: profileResponse.data.city || "",
          state: profileResponse.data.state || "",
        });

        setActivity(activityResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/users/profile", {
        username: profile.username.trim(),
        email: profile.email.trim(),
        profile_image: profile.profile_image.trim() || null,
        phone: profile.phone.trim() || null,
        date_of_birth: profile.date_of_birth || null,
        gender: profile.gender || null,
        city: profile.city.trim() || null,
        state: profile.state.trim() || null,
      });

      setProfile((previous) => ({
        ...previous,
        ...response.data,
        profile_image: response.data.profile_image || "",
        phone: response.data.phone || "",
        date_of_birth: response.data.date_of_birth || "",
        gender: response.data.gender || "",
        city: response.data.city || "",
        state: response.data.state || "",
      }));

      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-page">
        <p>Loading your profile...</p>
      </main>
    );
  }

  const initials = profile.username
    ? profile.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <p className="profile-eyebrow">YOUR ACCOUNT</p>
        <h1>My Profile</h1>
        <p>Manage your personal details and keep track of your event journey.</p>
      </header>

      {message && (
        <div className="profile-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="profile-error" role="alert">
          {error}
        </div>
      )}

      <section className="profile-card">
        <div className="profile-identity-header">
          <div className="profile-avatar">
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt="Profile"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              initials
            )}
          </div>

          <div className="profile-identity">
            <h2>{profile.username}</h2>
            <p>{profile.email}</p>
            <span>{profile.role || "USER"}</span>
          </div>

          <div className="profile-account-status">
            <span className="profile-status-dot" />
            Account Profile
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-section-heading">
            <h3>Personal Information</h3>
            <p>Keep your account information up to date.</p>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="username">Username *</label>
              <input
                id="username"
                name="username"
                value={profile.username}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                required
                autoComplete="username"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                maxLength={20}
                placeholder="Enter phone number"
                autoComplete="tel"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={profile.date_of_birth}
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="profile-field">
              <label htmlFor="profile_image">Profile Image URL</label>
              <input
                id="profile_image"
                name="profile_image"
                type="url"
                value={profile.profile_image}
                onChange={handleChange}
                maxLength={500}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter your city"
                autoComplete="address-level2"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                value={profile.state}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter your state"
                autoComplete="address-level1"
              />
            </div>
          </div>

          <div className="profile-form-footer">
            <p>Your personal information is used to manage your account.</p>
            <button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="profile-activity">
        <div className="profile-activity-heading">
          <div>
            <p className="profile-eyebrow">YOUR EVENTS</p>
            <h2>Booking Activity</h2>
          </div>
          <p className="profile-activity-subtitle">
            An overview of your SmartEvent bookings.
          </p>
        </div>

        <div className="profile-stats">
          <article>
            <span className="profile-stat-icon">
              <span>01</span>
            </span>
            <div>
              <span>Total Bookings</span>
              <strong>{activity.summary.total_bookings}</strong>
            </div>
          </article>

          <article>
            <span className="profile-stat-icon">
              <span>02</span>
            </span>
            <div>
              <span>Tickets Booked</span>
              <strong>{activity.summary.total_tickets}</strong>
            </div>
          </article>

          <article>
            <span className="profile-stat-icon">
              <span>03</span>
            </span>
            <div>
              <span>Total Spent</span>
              <strong>
                ₹
                {Number(activity.summary.total_spent || 0).toLocaleString(
                  "en-IN",
                  { maximumFractionDigits: 2 }
                )}
              </strong>
            </div>
          </article>
        </div>

        <div className="profile-recent-heading">
          <h3>Recent Bookings</h3>
          <span>{activity.bookings.length} records</span>
        </div>

        {activity.bookings.length === 0 ? (
          <div className="profile-empty">
            <h4>No bookings yet</h4>
            <p>Explore events and book your first ticket!</p>
          </div>
        ) : (
          <div className="profile-booking-list">
            {activity.bookings.map((booking) => (
              <article
                className="profile-booking"
                key={booking.booking_id}
              >
                <div className="profile-booking-details">
                  <h4>{booking.event_title}</h4>
                  <p>
                    Booking #{booking.booking_id} ·{" "}
                    {booking.ticket_quantity} ticket(s)
                  </p>
                  <small>
                    {booking.created_at
                      ? new Date(booking.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </small>
                </div>

                <div className="profile-booking-amount">
                  <strong>
                    ₹
                    {Number(booking.amount || 0).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                  <p>{booking.status}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;
