import React from "react";
import "./AdminHome.css";

function AdminHome({ admin, onLogout, notifications = [], onViewFlightSchedule }) {
  return (
    <div className="admin-home-page">
      <div className="admin-home-overlay">

        {/* ✅ TOP TOOLBAR */}
        <div className="admin-toolbar">
          <div className="admin-toolbar-left">
            <h1>Admin Dashboard</h1>
            <p>SkyConnect Airline Booking System</p>
          </div>

          <div className="admin-toolbar-right">
            {/* 🆕 Button to go to Flight Schedule page */}
            <button
              className="toolbar-view-flights-btn"
              onClick={onViewFlightSchedule}
            >
              View Flight Schedule
            </button>

            <span className="admin-name">👤 {admin?.name || "Admin"}</span>

            <button className="toolbar-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* ✅ MAIN CONTENT */}
        <div className="admin-center-content">
          {/* Left: Intro text */}
          <div className="admin-text-content">
            <h2>Welcome to the Admin Panel</h2>
            <p>
              This is the central control hub of the SkyConnect Airline Booking
              System. As an administrator, you are responsible for monitoring
              flight activity, managing passenger bookings, updating flight
              schedules, and ensuring the smooth operation of the entire airline
              platform. The system is powered by Apache Cassandra, which provides
              high-speed data storage, real-time updates, and massive scalability
              to handle large volumes of airline data efficiently.
            </p>

            <p className="admin-note">
              Future upgrades will include live booking tables, system alerts,
              real-time analytics, and flight management tools.
            </p>
          </div>

          {/* Right: Notifications from passengers (optional UI) */}
          <div className="admin-notifications-panel">
            <h3>Recent Notifications</h3>
            {notifications.length === 0 ? (
              <p className="admin-no-notifications">No notifications yet.</p>
            ) : (
              <ul className="admin-notifications-list">
                {notifications.slice(0, 5).map((note) => (
                  <li key={note.id} className="admin-notification-item">
                    <div className="admin-notification-message">
                      {note.message}
                    </div>
                    <div className="admin-notification-time">
                      {note.time}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminHome;
