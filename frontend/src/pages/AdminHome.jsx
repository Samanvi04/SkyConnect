import React from "react";
import "./AdminHome.css";

function AdminHome({ admin, onLogout }) {
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
            <span className="admin-name">👤 {admin?.name || "Admin"}</span>
            <button className="toolbar-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* ✅ CENTER PARAGRAPH TEXT (NO BOX) */}
        <div className="admin-center-content">
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
        </div>

      </div>
    </div>
  );
}

export default AdminHome;
