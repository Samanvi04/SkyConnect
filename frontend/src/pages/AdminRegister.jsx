import React, { useState } from "react";
import "./Auth.css";

function AdminRegister({ onRegistered, goBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/admins/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Admin registration failed");
        return;
      }

      alert("Admin registered successfully! Please login.");
      onRegistered(); // go back to admin login
    } catch (err) {
      console.error(err);
      alert("Could not connect to server. Check if backend is running.");
    }
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
