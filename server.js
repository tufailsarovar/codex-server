import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";

import { connectDB } from "./config/db.js";

import {
  testCloudinaryConnection,
} from "./config/cloudinary.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminProjectRoutes from "./routes/adminProjectRoutes.js";
import freeProjectRoutes from "./routes/freeProjectRoutes.js";
import adminFreeProjectRoutes from "./routes/adminFreeProjectRoutes.js";
import uploadRoutes from "./routes/upload.routes.js";

// AKTU routes
import aktuRoutes from "./routes/aktuRoutes.js";
import adminAktuRoutes from "./routes/adminAktuRoutes.js";
import aktuPaymentRoutes from "./routes/aktuPaymentRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;

// =========================
// DATABASE
// =========================

connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((error) => {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );
  });

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

const allowedOrigins = [
  "http://localhost:5173",
  "https://codex-tufail.vercel.app",
  "https://www.projectcodex.in",
  "https://projectcodex.in",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },

    credentials: true,
  })
);

app.options("*", cors());

// =========================
// HEALTH CHECK
// =========================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CodeX API is running",
  });
});

// =========================
// CLOUDINARY CONNECTION TEST
// =========================

app.get(
  "/health/cloudinary",
  async (req, res) => {
    try {
      const result =
        await testCloudinaryConnection();

      res.status(200).json({
        connected: true,
        message:
          "Cloudinary connected successfully",
        result,
      });
    } catch (error) {
      console.error(
        "❌ Cloudinary test failed:",
        error
      );

      res.status(500).json({
        connected: false,
        message:
          "Cloudinary connection failed",
        error:
          error.message ||
          "Unknown Cloudinary error",
      });
    }
  }
);

// =========================
// ROOT
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "CodeX API running",
  });
});

// =========================
// EXISTING ROUTES
// =========================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/projects",
  projectRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/download",
  downloadRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);

app.use(
  "/api/admin/projects",
  adminProjectRoutes
);

app.use(
  "/api/free-projects",
  freeProjectRoutes
);

app.use(
  "/api/admin/free-projects",
  adminFreeProjectRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

// =========================
// AKTU ROUTES
// =========================

app.use(
  "/api/aktu",
  aktuRoutes
);

app.use(
  "/api/admin/aktu",
  adminAktuRoutes
);

// =========================
// AKTU PAYMENT ROUTES
// =========================

app.use(
  "/api/aktu-payment",
  aktuPaymentRoutes
);

// =========================
// ERROR HANDLER
// =========================

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err
    );

    res.status(500).json({
      message: "Server error",

      error:
        process.env.NODE_ENV ===
        "development"
          ? err.message
          : undefined,
    });
  }
);

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(
    `✅ Server running on port ${PORT}`
  );
});

export default app;