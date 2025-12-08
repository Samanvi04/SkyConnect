import React from "react";
import "./RoleSelection.css";

function RoleSelection({ onSelectPassenger, onSelectAdmin }) {
  return (
    <div className="role-full-page">
      <div className="role-full-content">
        {/* Title Section */}
        <div className="role-hero">
          <h1 className="role-main-title">SkyConnect</h1>
          <h2 className="role-sub-title">Smart Airline Booking System</h2>
          <p className="role-slogan">
            Fly Smarter • Book Faster • Powered by Cassandra
          </p>
        </div>

        {/* Role Cards */}
        <div className="role-full-cards">
          {/* Passenger */}
          <div className="role-full-card passenger-card">
            <div className="role-full-icon">✈️</div>
            <h3>Passenger</h3>
            <p>
              Search flights, book tickets, manage your trips and view your
              bookings instantly.
            </p>
            <button onClick={onSelectPassenger}>
              Continue as Passenger
            </button>
          </div>

          {/* Admin */}
          <div className="role-full-card admin-card">
            <div className="role-full-icon">🛠️</div>
            <h3>Admin</h3>
            <p>
              Manage flights, monitor bookings, and control airline operations
              in real time.
            </p>
            <button className="btn-outline" onClick={onSelectAdmin}>
              Continue as Admin
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="role-footer-text">
          Secure • Scalable • High-Speed Booking with Apache Cassandra
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;
