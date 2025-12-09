import React, { useState } from "react";
import "./PassengerHome.css";

function PassengerHome({ passenger, onLogout, sendNotification }) {
  const [showBooking, setShowBooking] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [results, setResults] = useState([]);
  const [bookingMessage, setBookingMessage] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError("");
    setResults([]);
    setBookingMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, date }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || "Failed to search flights.");
        return;
      }

      if (!data.flights || data.flights.length === 0) {
        setSearchError("No flights available for the given details.");
      } else {
        setResults(data.flights);
      }
    } catch (err) {
      console.error(err);
      setSearchError("Could not connect to server.");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleBook(flight) {
    setBookingMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerEmail: passenger.email,
          flight,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingMessage(data.error || "Failed to book flight.");
        return;
      }

      setBookingMessage("Flight booked successfully!");

      if (sendNotification) {
        sendNotification(
          `${passenger.name} booked flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination} on ${flight.departureDate}.`
        );
      }
    } catch (err) {
      console.error(err);
      setBookingMessage("Could not connect to server to book flight.");
    }
  }

  return (
    <div className="passenger-home-page">
      <div className="passenger-home-overlay">
        {/* ✅ TOP TOOLBAR */}
        <div className="passenger-toolbar">
          <div className="passenger-toolbar-left">
            <h1>Passenger Dashboard</h1>
            <p>Welcome to SkyConnect Airline Booking System</p>
          </div>

          <div className="passenger-toolbar-right">
            <button
              className="toolbar-book-btn"
              onClick={() => setShowBooking((prev) => !prev)}
            >
              {showBooking ? "Close Booking" : "Book Flight"}
            </button>

            <span className="passenger-name">
              ✈️ {passenger?.name || "Passenger"}
            </span>

            <button className="toolbar-logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* ✅ MAIN CONTENT */}
        <div className="passenger-center-content">
          <div className="passenger-text-content">
            <h2>Plan Your Journey</h2>
            <p>
              Use the booking option to search for available flights based on
              your travel date, starting point, and destination. Once you find
              a suitable flight, confirm your booking and our system will
              notify the admin for further processing.
            </p>
          </div>

          {showBooking && (
            <div className="passenger-booking-section">
              <h3>Book a Flight</h3>
              <p className="booking-subtitle">
                Choose your <strong>departure date</strong>, starting city and destination to
                check available flights.
              </p>

              {/* 🔹 Better layout for date + from + to */}
              <form className="booking-form" onSubmit={handleSearch}>
                <div className="booking-row">
                  <div className="booking-field">
                    <label>Departure Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                    <span className="field-hint">
                      Select the exact date you want to travel.
                    </span>
                  </div>

                  <div className="booking-field">
                    <label>From (Departure)</label>
                    <input
                      type="text"
                      placeholder="e.g., Bangalore"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      required
                    />
                    <span className="field-hint">
                      Enter your starting city.
                    </span>
                  </div>

                  <div className="booking-field">
                    <label>To (Destination)</label>
                    <input
                      type="text"
                      placeholder="e.g., Delhi"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                    <span className="field-hint">
                      Enter the city you want to reach.
                    </span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button type="submit" className="booking-search-btn">
                    {searchLoading ? "Searching..." : "Search Flights"}
                  </button>
                </div>
              </form>

              {searchError && (
                <p style={{ color: "red", marginTop: "8px" }}>{searchError}</p>
              )}

              {results.length > 0 && (
                <div className="booking-results">
                  <h4>Available Flights</h4>
                  <table className="flights-table">
                    <thead>
                      <tr>
                        <th>Flight No.</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Departure Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((flight) => (
                        <tr key={flight.flightId}>
                          <td>{flight.flightNumber}</td>
                          <td>{flight.origin}</td>
                          <td>{flight.destination}</td>
                          <td>{flight.departureDate}</td>
                          <td>
                            <button
                              className="booking-book-btn"
                              onClick={() => handleBook(flight)}
                            >
                              Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {bookingMessage && (
                <p style={{ marginTop: "10px" }}>{bookingMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PassengerHome;
