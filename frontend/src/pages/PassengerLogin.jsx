import React, { useState } from "react";
import "./Auth.css";

function PassengerLogin({ onLogin, goBackToRole, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/passengers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // call parent with logged-in user details
      onLogin(data.passenger);
    } catch (err) {
      console.error(err);
      alert("Could not connect to server. Check if backend is running.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay" />

      <div className="auth-card">
        {/* Back link to role selection */}
        <button className="auth-back" onClick={goBackToRole}>
          ← Back to Role Selection
        </button>

        <h2>Passenger Login</h2>
        <p className="auth-subtitle">
          Login to book flights and manage your journeys.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="auth-btn">
            Sign In
          </button>
        </form>

        <div className="auth-footer-link">
          New user?{" "}
          <button onClick={goToRegister}>Create an account</button>
        </div>
      </div>
    </div>
  );
}

export default PassengerLogin;
