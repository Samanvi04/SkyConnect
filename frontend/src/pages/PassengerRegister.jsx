import React, { useState } from "react";
import "./Auth.css";

function PassengerRegister({ onRegistered, goBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/passengers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Registration failed");
        return;
      }

      alert("Passenger registered successfully! Please login.");
      onRegistered(); // go back to login page (your existing logic)
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
          ← Back to Login
        </button>

        <h2>Passenger Register</h2>
        <p className="auth-subtitle">
          Sign up to start booking flights and managing journeys.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
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
            Create Account
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account?{" "}
          <button onClick={goBackToLogin}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default PassengerRegister;
