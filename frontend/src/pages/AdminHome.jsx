import React, { useState } from "react";
import "./AdminHome.css";

function AdminHome({ admin, onLogout }) {
  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [flightError, setFlightError] = useState("");
  const [currentMonthLabel, setCurrentMonthLabel] = useState("");

  async function handleViewFlights() {
    setLoadingFlights(true);
    setFlightError("");

    // This matches the hardcoded flights we inserted in Cassandra
    setCurrentMonthLabel("December 2025");

    try {
      const res = await fetch(
        "http://localhost:5000/api/flights?month=2025-12"
      );
      const data = await res.json();

      if (!res.ok) {
        setFlightError(data.error || "Failed to load flights.");
        setFlights([]);
      } else {
        setFlights(data.flights || []);
      }
    } catch (err) {
      console.error(err);
      setFlightError("Could not connect to server.");
      setFlights([]);
    } finally {
      setLoadingFlights(false);
    }
  }

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
            <button
              className="toolbar-view-flights-btn"
              onClick={handleViewFlights}
            >
              View Flight Schedule
            </button>

            <span className="admin-name">👤 {admin?.name || "Admin"}</span>

            <button className="toolbar-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* ✅ CENTER CONTENT */}
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

          {/* ✅ FLIGHTS LIST SECTION */}
          <div className="admin-flights-section">
            {loadingFlights && <p>Loading flights...</p>}

            {flightError && <p style={{ color: "red" }}>{flightError}</p>}

            {!loadingFlights && !flightError && flights.length > 0 && (
              <>
                <h3>Flights scheduled for {currentMonthLabel}</h3>
                <table className="flights-table">
                  <thead>
                    <tr>
                      <th>Flight No.</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Departure Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight, index) => (
                      <tr key={flight.flightId || index}>
                        <td>{flight.flightNumber}</td>
                        <td>{flight.origin}</td>
                        <td>{flight.destination}</td>
                        <td>{flight.departureDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {!loadingFlights &&
              !flightError &&
              flights.length === 0 &&
              currentMonthLabel && (
                <p>No flights found</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
