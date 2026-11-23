import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import ambulanceRoutes from "./routes/ambulanceRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";

// Load environment variables from .env
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Allow larger JSON requests.
app.use(express.json({ limit: "8mb" }));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to AAYUSHMAN Backend API",
  });
});

// Server health-check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AAYUSHMAN server is running successfully!",
    status: "Healthy",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Appointment routes
app.use("/api/appointments", appointmentRoutes);

// Cloudflare AI Health Assistant routes
app.use("/api/ai", aiRoutes);

// Ambulance booking and tracking routes
app.use("/api/ambulance", ambulanceRoutes);

// Pharmacy medicines and orders routes
app.use("/api/pharmacy", pharmacyRoutes);

// Connect MongoDB first, then start the server
const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`AAYUSHMAN server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
