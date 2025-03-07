import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import interviewRoutes from "./routes/interviews.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run sets PORT environment variable
const PORT = parseInt(process.env.PORT || "8000", 10);

// Log environment information
console.log(`Starting server with NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT environment variable: ${process.env.PORT}`);
console.log(`Using PORT: ${PORT}`);

// Middleware
app.use(cors());
app.use(express.json());

// Health check route - always return 200 for Cloud Run health checks
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Root route for quick testing
app.get("/", (req, res) => {
  res.status(200).json({ message: "Voice Hire API is running" });
});

// API Routes - only use if MongoDB is connected
app.use("/api/auth", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database connection unavailable" });
  }
  next();
}, authRoutes);

app.use("/api/interviews", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database connection unavailable" });
  }
  next();
}, interviewRoutes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// For any route that doesn't match an API route, serve the frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server first, then try to connect to MongoDB
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server address: ${server.address().address}:${server.address().port}`);
  
  // Now try to connect to MongoDB
  connectDB()
    .then((conn) => {
      if (conn) {
        console.log("MongoDB connection successful");
      } else {
        console.log("Server running without MongoDB connection");
      }
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
      console.log("Server will continue running without MongoDB");
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});
