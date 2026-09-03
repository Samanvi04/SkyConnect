const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { createTracer } = require("tracewell_agent_node");
const {
  tracewellMiddleware,
  getTracer,
} = require("tracewell_agent_node/src/adapters/express.js");
const {
  instrumentMongoCommands,
} = require("tracewell_agent_node/src/db/mongoCapture.js");

dotenv.config();

const Passenger = require("./models/Passenger");
const Admin = require("./models/Admin");
const Flight = require("./models/Flight");
const Booking = require("./models/Booking");

const app = express();

const tracer = createTracer({ appName: "sky-connect", framework: "express" });
app.use(tracewellMiddleware(tracer));

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, { monitorCommands: true })
  .then(() => {
    console.log("Connected to MongoDB");
    instrumentMongoCommands(mongoose.connection.getClient(), tracer);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("SkyConnect backend is running");
});

app.post("/api/passengers/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {
    const existingPassenger = await Passenger.findOne({
      email: email.toLowerCase(),
    });

    if (existingPassenger) {
      return res.status(400).json({
        error: "Email already registered.",
      });
    }

    const passenger = await Passenger.create({
      name,
      email,
      password,
    });

    return res.json({
      success: true,
      message: "Passenger registered successfully.",
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
      },
    });
  } catch (err) {
    console.error("Error in passenger /register:", err);

    return res.status(500).json({
      error: "Server error while registering passenger.",
    });
  }
});

app.post("/api/passengers/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
    });
  }

  try {
    const passenger = await Passenger.findOne({
      email: email.toLowerCase(),
    });

    if (!passenger) {
      return res.status(400).json({
        error: "Passenger not found.",
      });
    }

    if (passenger.password !== password) {
      return res.status(400).json({
        error: "Incorrect password.",
      });
    }

    return res.json({
      success: true,
      message: "Passenger login successful.",
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
      },
    });
  } catch (err) {
    console.error("Error in passenger /login:", err);

    return res.status(500).json({
      error: "Server error while logging in passenger.",
    });
  }
});

app.post("/api/admins/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        error: "Admin email already registered.",
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    return res.json({
      success: true,
      message: "Admin registered successfully.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Error in admin /register:", err);

    return res.status(500).json({
      error: "Server error while registering admin.",
    });
  }
});

app.post("/api/admins/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
    });
  }

  try {
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(400).json({
        error: "Admin not found.",
      });
    }

    if (admin.password !== password) {
      return res.status(400).json({
        error: "Incorrect password.",
      });
    }

    return res.json({
      success: true,
      message: "Admin login successful.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Error in admin /login:", err);

    return res.status(500).json({
      error: "Server error while logging in admin.",
    });
  }
});

app.get("/api/flights", async (req, res) => {
  const month = req.query.month;

  try {
    let query = {};

    // If month is provided
    if (month) {
      const [year, monthNumber] = month.split("-");

      const startDate = new Date(Number(year), Number(monthNumber) - 1, 1);

      const endDate = new Date(Number(year), Number(monthNumber), 1);

      query = {
        departureDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };
    }

    const flights = await Flight.find(query).sort({
      departureDate: 1,
    });

    const formattedFlights = flights.map((flight) => ({
      monthKey: flight.departureDate.toISOString().slice(0, 7),

      flightId: flight._id.toString(),

      flightNumber: flight.flightNumber,

      origin: flight.origin,

      destination: flight.destination,

      departureDate: flight.departureDate.toISOString().slice(0, 10),
    }));

    return res.json({
      success: true,
      flights: formattedFlights,
    });
  } catch (err) {
    console.error("Error in GET /api/flights:", err);

    return res.status(500).json({
      error: "Server error while fetching flights.",
    });
  }
});

app.post("/api/flights/search", async (req, res) => {
  const { origin, destination, date } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({
      error: "Origin, destination and date are required.",
    });
  }

  try {
    // Create date range for the selected day
    const startDate = new Date(`${date}T00:00:00.000Z`);

    const endDate = new Date(`${date}T23:59:59.999Z`);

    const flights = await Flight.find({
      origin: {
        $regex: new RegExp(`^${origin}$`, "i"),
      },

      destination: {
        $regex: new RegExp(`^${destination}$`, "i"),
      },

      departureDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const formattedFlights = flights.map((flight) => ({
      monthKey: flight.departureDate.toISOString().slice(0, 7),

      flightId: flight._id.toString(),

      flightNumber: flight.flightNumber,

      origin: flight.origin,

      destination: flight.destination,

      departureDate: flight.departureDate.toISOString().slice(0, 10),
    }));

    return res.json({
      success: true,
      flights: formattedFlights,
    });
  } catch (err) {
    console.error("Error in POST /api/flights/search:", err);

    return res.status(500).json({
      error: "Server error while searching flights.",
    });
  }
});

app.post("/api/bookings", async (req, res) => {
  const t = getTracer();
  const { passengerEmail, flight } = req.body;

  if (!passengerEmail || !flight) {
    return res.status(400).json({
      error: "Passenger email and flight details are required.",
    });
  }

  const { flightId, flightNumber, origin, destination, departureDate } = flight;

  if (!flightId || !flightNumber || !origin || !destination || !departureDate) {
    return res.status(400).json({
      error: "Incomplete flight data. Please search again.",
    });
  }

  try {
    let passenger;
    await t.span(
      "verify_passenger",
      { email: passengerEmail },
      async (span) => {
        passenger = await Passenger.findOne({
          email: passengerEmail.toLowerCase(),
        });
        span.metadata.found = !!passenger;
      },
    );

    if (!passenger) {
      return res.status(404).json({
        error: "Passenger not found.",
      });
    }

    let existingFlight;
    await t.span("verify_flight", { flightId }, async (span) => {
      existingFlight = await Flight.findById(flightId);
      span.metadata.found = !!existingFlight;
    });

    if (!existingFlight) {
      return res.status(404).json({
        error: "Flight not found.",
      });
    }

    let booking;
    await t.span("create_booking", async (span) => {
      booking = await Booking.create({
        passengerEmail,
        flight: flightId,
        flightNumber,
        origin,
        destination,
        departureDate: new Date(departureDate),
        bookedAt: new Date(),
      });
      span.metadata.booking_id = booking._id.toString();
    });

    return res.json({
      success: true,
      message: "Flight booked successfully.",

      booking: {
        bookingId: booking._id.toString(),
        passengerEmail: booking.passengerEmail,
        flightNumber: booking.flightNumber,
        origin: booking.origin,
        destination: booking.destination,
        departureDate: booking.departureDate.toISOString().slice(0, 10),
        bookedAt: booking.bookedAt,
      },
    });
  } catch (err) {
    console.error("❌ Error in POST /api/bookings:", err);

    return res.status(500).json({
      error: "Server error while booking flight.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
