import React from "react";
import "./PassengerHome.css";

function PassengerHome({ passenger, onLogout }) {
  return (
    <div className="passenger-home-page">
      <div className="passenger-home-overlay">

        {/* ✅ TOP TOOLBAR */}
        <div className="passenger-toolbar">
          <div className="passenger-toolbar-left">
            <h1>Passenger Dashboard</h1>
            <p>SkyConnect Airline Booking System</p>
          </div>

          <div className="passenger-toolbar-right">
            <span className="passenger-name">
              👤 {passenger?.name || "Passenger"}
            </span>
            <button className="toolbar-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* ✅ LEFT-SIDE INFO TEXT */}
        <div className="passenger-center-content">
          <div className="passenger-text-content">
            <h2>Welcome to Your Passenger Panel</h2>
            <p>
              This is your personal space in the SkyConnect Airline Booking
              System. As a passenger, you can search for available flights,
              book tickets in real-time, view your upcoming journeys, and manage
              your bookings efficiently. All your flight and booking data is
              stored securely using Apache Cassandra for fast access and high
              reliability.
            </p>

            <p className="passenger-note">
              Upcoming features include live flight tracking, booking history,
              digital boarding passes, and real-time notifications.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PassengerHome;
