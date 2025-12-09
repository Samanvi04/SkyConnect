const express = require("express");
const cors = require("cors");
const cassandra = require("cassandra-driver");

const { types } = cassandra; // for UUID and LocalDate

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Cassandra connection
const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],  // Cassandra on local machine / Docker
  localDataCenter: "datacenter1", // default data center name
  keyspace: "airline_app",        // make sure this keyspace exists
});

// 🔹 Hardcoded demo flights to insert into DB
async function insertHardcodedFlights() {
  const flights = [
    { flightNumber: "SC101", origin: "Bangalore", destination: "Delhi", date: "2025-12-05" },
    { flightNumber: "SC202", origin: "Mumbai", destination: "Chennai", date: "2025-12-12" },
    { flightNumber: "SC303", origin: "Hyderabad", destination: "Kolkata", date: "2025-12-18" },
    { flightNumber: "SC404", origin: "Delhi", destination: "Goa", date: "2025-12-25" },
  ];

  console.log("✅ Inserting hardcoded demo flights into Cassandra...");

  for (const f of flights) {
    try {
      const monthKey = f.date.slice(0, 7); // '2025-12'
      const flightId = types.Uuid.random();
      const jsDate = new Date(f.date);
      const cassDate = types.LocalDate.fromDate(jsDate);

      const query = `
        INSERT INTO flights (month_key, flight_id, flight_number, origin, destination, departure_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await client.execute(
        query,
        [monthKey, flightId, f.flightNumber, f.origin, f.destination, cassDate],
        { prepare: true }
      );
    } catch (err) {
      console.error("Error inserting hardcoded flight:", err);
    }
  }

  console.log("✅ Hardcoded flights inserted.");
}

client
  .connect()
  .then(async () => {
    console.log("✅ Connected to Cassandra");
    await insertHardcodedFlights(); // insert demo data once backend starts
  })
  .catch((err) => console.error("❌ Cassandra connection error:", err));

/* =========================
   SIMPLE HEALTH CHECK
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
 * GET /api/flights/demo
 * Hardcoded month: 2025-12
 * This is what AdminHome will call
 */
app.get("/api/flights/demo", async (req, res) => {
  const monthKey = "2025-12";

  try {
    const query = `
      SELECT month_key, flight_id, flight_number, origin, destination, departure_date
      FROM flights
      WHERE month_key = ?
    `;

    const result = await client.execute(query, [monthKey], { prepare: true });

    const flights = result.rows.map((row) => ({
      monthKey: row.month_key,
      flightId: row.flight_id.toString(),
      flightNumber: row.flight_number,
      origin: row.origin,
      destination: row.destination,
      departureDate: row.departure_date
        ? row.departure_date.toString()
        : null,
    }));

    return res.json({
      success: true,
      flights,
    });
  } catch (err) {
    console.error("Error in GET /api/flights/demo:", err);
    return res
      .status(500)
      .json({ error: "Server error while fetching demo flights." });
  }
});

/* =========================
   START SERVER
   ========================= */

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
