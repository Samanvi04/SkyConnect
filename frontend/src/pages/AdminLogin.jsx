import React, { useState } from "react";
import "./Auth.css";

function AdminLogin({ onLogin, goBackToRole, goToRegister }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/admins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Admin login failed.");
        return;
      }

      // ✅ Logged-in admin info from backend
      onLogin(data.admin);
    } catch (err) {
      console.error(err);
      setError("Could not connect to server. Is backend running?");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay" />

      <div className="auth-card">
        <button className="auth-back" onClick={goBackToRole}>
          ← Back to Role Selection
        </button>

        <h2>Admin Login</h2>
        <p className="auth-subtitle">
          Login to monitor bookings and manage airline operations.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Admin Email
            <input
              type="email"
              value={email}
              placeholder="admin@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              placeholder="admin123"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}

          <button type="submit" className="auth-btn">
            Sign In as Admin
          </button>
        </form>

        <div className="auth-footer-link">
          New admin?{" "}
          <button onClick={goToRegister}>Create an admin account</button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
