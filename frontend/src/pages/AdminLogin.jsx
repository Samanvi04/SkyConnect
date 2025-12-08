import React, { useState } from "react";
import "./Auth.css";

function AdminLogin({ onLogin, goBackToRole, goToRegister }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");

  function handleSubmit(e) {
    e.preventDefault();
    const fakeAdmin = { name: "Main Admin", email };
    onLogin(fakeAdmin); // ✅ This triggers navigation to admin-home in App.jsx
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

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
