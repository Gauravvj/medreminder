const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startReminderService } = require('./services/reminderService');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const logRoutes = require('./routes/logRoutes');
const alertRoutes = require('./routes/alertRoutes');
const cognitiveRoutes = require('./routes/cognitiveRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();

// ─────────────────────────────────────────────
// DB CONNECTION (SAFE START)
// ─────────────────────────────────────────────
connectDB().catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
});

// ─────────────────────────────────────────────
// ALLOWED ORIGINS
// ─────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "https://medreminder-six.vercel.app",
  "https://medreminder-3o326ufs6-gauravvjs-projects.vercel.app"
];

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked CORS:", origin);
      return callback(null, false);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Preflight
app.options("*", cors());

app.use(express.json());

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/cognitive', cognitiveRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/location', locationRoutes);

// ─────────────────────────────────────────────
// BASIC ROUTES
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Medicine Reminder API is running'
  });
});

// ─────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// ─────────────────────────────────────────────
// START SERVER (RAILWAY SAFE)
// ─────────────────────────────────────────────
const PORT = process.env.PORT;

if (!PORT) {
  console.error("❌ PORT not defined by Railway");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Start reminder service safely
  try {
    startReminderService();
  } catch (err) {
    console.error("❌ Reminder service error:", err.message);
  }
});
