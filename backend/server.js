const express = require("express");
const cors = require("cors");
const cassandra = require("cassandra-driver");

const app = express();
app.use(cors());
app.use(express.json());

const { types } = cassandra;

// 🔌 Cassandra connection
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],   // Docker Cassandra → localhost
  localDataCenter: "datacenter1", // default DC name
  keyspace: "airline_app",        // make sure this exists in cqlsh
});

client
  .connect()
  .then(() => console.log("✅ Connected to Cassandra"))
  .catch((err) => console.error("❌ Cassandra connection error:", err));

/* =========================
   BASIC HEALTH CHECK
   ========================= */

app.get("/", (req, res) => {
  res.send("SkyConnect backend is running ✅");
});

/* =========================
   PASSENGER ROUTES
   ========================= */

/**
 * POST /api/passengers/register
 * Body: { name, email, password }
 */
app.post("/api/passengers/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const checkQuery = "SELECT email FROM passengers WHERE email = ?";
    const checkResult = await client.execute(checkQuery, [email], {
      prepare: true,
    });

    if (checkResult.rowLength > 0) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const insertQuery =
      "INSERT INTO passengers (email, name, password) VALUES (?, ?, ?)";
    await client.execute(insertQuery, [email, name, password], {
      prepare: true,
    });

    return res.json({
      success: true,
      message: "Passenger registered successfully.",
      passenger: { name, email },
    });
  } catch (err) {
    console.error("Error in passenger /register:", err);
    return res
      .status(500)
      .json({ error: "Server error while registering passenger." });
  }
});

/**
 * POST /api/passengers/login
 * Body: { email, password }
 */
app.post("/api/passengers/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const query =
      "SELECT email, name, password FROM passengers WHERE email = ?";
    const result = await client.execute(query, [email], { prepare: true });

    if (result.rowLength === 0) {
      return res.status(400).json({ error: "Passenger not found." });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    return res.json({
      success: true,
      message: "Passenger login successful.",
      passenger: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in passenger /login:", err);
    return res
      .status(500)
      .json({ error: "Server error while logging in passenger." });
  }
});

/* =========================
   ADMIN ROUTES
   ========================= */

/**
 * POST /api/admins/register
 * Body: { name, email, password }
 */
app.post("/api/admins/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const checkQuery = "SELECT email FROM admins WHERE email = ?";
    const checkResult = await client.execute(checkQuery, [email], {
      prepare: true,
    });

    if (checkResult.rowLength > 0) {
      return res
        .status(400)
        .json({ error: "Admin email already registered." });
    }

    const insertQuery =
      "INSERT INTO admins (email, name, password) VALUES (?, ?, ?)";
    await client.execute(insertQuery, [email, name, password], {
      prepare: true,
    });

    return res.json({
      success: true,
      message: "Admin registered successfully.",
      admin: { name, email },
    });
  } catch (err) {
    console.error("Error in admin /register:", err);
    return res
      .status(500)
      .json({ error: "Server error while registering admin." });
  }
});

/**
 * POST /api/admins/login
 * Body: { email, password }
 */
app.post("/api/admins/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const query = "SELECT email, name, password FROM admins WHERE email = ?";
    const result = await client.execute(query, [email], { prepare: true });

    if (result.rowLength === 0) {
      return res.status(400).json({ error: "Admin not found." });
    }

    const admin = result.rows[0];

    if (admin.password !== password) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    return res.json({
      success: true,
      message: "Admin login successful.",
      admin: {
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Error in admin /login:", err);
    return res
      .status(500)
      .json({ error: "Server error while logging in admin." });
  }
});

/* =========================
   FLIGHT ROUTES
   ========================= */

/**
 * GET /api/flights?month=YYYY-MM
 * Used by AdminHome to view monthly schedule
 * Your hardcoded flights use month_key = '2025-12'
 */
app.get("/api/flights", async (req, res) => {
  const month = req.query.month || "2025-12";

  try {
    const query = `
      SELECT month_key, flight_id, flight_number, origin, destination, departure_date
      FROM flights
      WHERE month_key = ?
    `;

    const result = await client.execute(query, [month], { prepare: true });

    const flights = result.rows.map((row) => ({
      monthKey: row.month_key,
      flightId: row.flight_id.toString(),
      flightNumber: row.flight_number,
      origin: row.origin,
      destination: row.destination,
      departureDate: row.departure_date
        ? row.departure_date.toString() // 'YYYY-MM-DD'
        : null,
    }));

    return res.json({
      success: true,
      flights,
    });
  } catch (err) {
    console.error("Error in GET /api/flights:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching flights." });
  }
});

/**
 * POST /api/flights/search
 * Body: { origin, destination, date }  // date = 'YYYY-MM-DD'
 * Used by PassengerHome when searching flights
 */
app.post("/api/flights/search", async (req, res) => {
  const { origin, destination, date } = req.body;

  if (!origin || !destination || !date) {
    return res
      .status(400)
      .json({ error: "Origin, destination and date are required." });
  }

  try {
    const monthKey = date.slice(0, 7); // 'YYYY-MM'

    const query = `
      SELECT month_key, flight_id, flight_number, origin, destination, departure_date
      FROM flights
      WHERE month_key = ?
      ALLOW FILTERING
    `;

    const result = await client.execute(query, [monthKey], { prepare: true });

    // Filter in JS by origin, destination, and exact date
    const matching = result.rows
      .filter(
        (row) =>
          row.origin.toLowerCase() === origin.toLowerCase() &&
          row.destination.toLowerCase() === destination.toLowerCase() &&
          row.departure_date &&
          row.departure_date.toString() === date
      )
      .map((row) => ({
        monthKey: row.month_key,
        flightId: row.flight_id.toString(),
        flightNumber: row.flight_number,
        origin: row.origin,
        destination: row.destination,
        departureDate: row.departure_date.toString(), // 'YYYY-MM-DD'
      }));

    return res.json({
      success: true,
      flights: matching,
    });
  } catch (err) {
    console.error("Error in POST /api/flights/search:", err);
    return res
      .status(500)
      .json({ error: "Server error while searching flights." });
  }
});

/* =========================
   BOOKING ROUTES
   ========================= */

/**
 * POST /api/bookings
 * Body: { passengerEmail, flight }
 * flight = { flightId, flightNumber, origin, destination, departureDate }
 * Used by PassengerHome when booking
 */
app.post("/api/bookings", async (req, res) => {
  const { passengerEmail, flight } = req.body;

  if (!passengerEmail || !flight) {
    return res
      .status(400)
      .json({ error: "Passenger email and flight details are required." });
  }

  const { flightId, flightNumber, origin, destination, departureDate } = flight;

  if (!flightId || !flightNumber || !origin || !destination || !departureDate) {
    return res.status(400).json({
      error: "Incomplete flight data. Please search again.",
    });
  }

  try {
    const bookingId = types.Uuid.random();
    const bookedAt = new Date();

    // departureDate string 'YYYY-MM-DD' → LocalDate
    let cassDate;
    try {
      cassDate = types.LocalDate.fromString(departureDate);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Invalid departureDate format. Use YYYY-MM-DD." });
    }

    const query = `
      INSERT INTO bookings (
        booking_id,
        passenger_email,
        flight_id,
        flight_number,
        origin,
        destination,
        departure_date,
        booked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await client.execute(
      query,
      [
        bookingId,
        passengerEmail,
        types.Uuid.fromString(flightId),
        flightNumber,
        origin,
        destination,
        cassDate,
        bookedAt,
      ],
      { prepare: true }
    );

    return res.json({
      success: true,
      message: "Flight booked successfully.",
      booking: {
        bookingId: bookingId.toString(),
        passengerEmail,
        flightNumber,
        origin,
        destination,
        departureDate,
        bookedAt,
      },
    });
  } catch (err) {
    console.error("❌ Error in POST /api/bookings:", err);
    return res
      .status(500)
      .json({ error: "Server error while booking flight." });
  }
});

/* =========================
   START SERVER
   ========================= */

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
