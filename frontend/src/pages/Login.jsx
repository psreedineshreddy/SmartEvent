
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState("USER");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const accessToken = response.data.access_token;

      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const role = payload.role;

      if (role !== selectedPortal) {
        setError(
          `These credentials do not belong to a ${selectedPortal.toLowerCase()} account.`
        );
        return;
      }

      login(accessToken);

      if (role === "ORGANIZER") {
        navigate("/organizer");
      } else if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-icon">S</div>
        <span>SmartEvent</span>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>
            {selectedPortal === "USER"
              ? "User Login"
              : selectedPortal === "ORGANIZER"
                ? "Organizer Login"
                : "Admin Login"}
          </h1>

          <p>
            {selectedPortal === "USER"
              ? "Sign in to discover and book events."
              : selectedPortal === "ORGANIZER"
                ? "Sign in to manage your events."
                : "Sign in to manage the SmartEvent platform."}
          </p>
        </div>

        <div className="portal-options">
          <button
            type="button"
            className={`portal-option ${
              selectedPortal === "USER" ? "selected" : ""
            }`}
            onClick={() => setSelectedPortal("USER")}
          >
            <div className="portal-icon">👤</div>
            <div>
              <strong>User</strong>
              <span>Discover &amp; book events</span>
            </div>
          </button>

          <button
            type="button"
            className={`portal-option ${
              selectedPortal === "ORGANIZER" ? "selected" : ""
            }`}
            onClick={() => setSelectedPortal("ORGANIZER")}
          >
            <div className="portal-icon">🎯</div>
            <div>
              <strong>Organizer</strong>
              <span>Manage your events</span>
            </div>
          </button>

          <button
            type="button"
            className={`portal-option ${
              selectedPortal === "ADMIN" ? "selected" : ""
            }`}
            onClick={() => setSelectedPortal("ADMIN")}
          >
            <div className="portal-icon">🛡️</div>
            <div>
              <strong>Admin</strong>
              <span>Manage the platform</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
            </div>

            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-divider">
          <span>New to SmartEvent?</span>
        </div>

        <Link to="/register" className="auth-register-button">
          Create an account
        </Link>
      </div>
    </main>
  );
}

export default Login;
