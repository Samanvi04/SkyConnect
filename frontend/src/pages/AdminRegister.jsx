import React, { useState } from "react";
import "./Auth.css";

function AdminRegister({ onRegistered, goBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert("Admin registered successfully! Please login.");
    onRegistered();
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay" />

      <div className="auth-card">
        <button className="auth-back" onClick={goBackToLogin}>
          ← Back to Admin Login
        </button>

        <h2>Admin Register</h2>
        <p className="auth-subtitle">
          Create an admin account to manage the airline system.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              placeholder="Admin name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="auth-btn">
            Create Admin Account
          </button>
        </form>

        <div className="auth-footer-link">
          Already an admin?{" "}
          <button onClick={goBackToLogin}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
