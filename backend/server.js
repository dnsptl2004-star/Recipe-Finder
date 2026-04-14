// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import aiRoutes from "./routes/aiRoutes.js";
import recipesRoutes from "./routes/recipes.js";
import feedbackRoutes from "./routes/feedback.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// ── CORS: allow Vercel domains + localhost for dev ──
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost",       // Capacitor Android
  "capacitor://localhost", // Capacitor iOS/Android
  /\.vercel\.app$/,       // any *.vercel.app subdomain
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      callback(null, allowed);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ── MongoDB connection (cached for serverless cold-starts) ──
let cachedDb = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  
  cachedDb = await mongoose.connect(process.env.MONGO_URI, {
    dbName: "recipesDB",
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000, 
  });
  console.log("✅ Connected to MongoDB");
  return cachedDb;
}

// Ensure DB is connected before any request reaches a route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed. 🔒 Check MongoDB Atlas Network Access (needs 0.0.0.0/0)",
      error: err.message
    });
  }
});

// ── Routes ──
app.use("/api/recipes", recipesRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// Health-check
app.get("/", (req, res) => res.send("Backend running"));

// ── Only listen when NOT running as a Vercel serverless function ──
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

export default app;
