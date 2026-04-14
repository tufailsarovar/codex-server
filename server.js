import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminProjectRoutes from "./routes/adminProjectRoutes.js";
import freeProjectRoutes from "./routes/freeProjectRoutes.js";
import adminFreeProjectRoutes from "./routes/adminFreeProjectRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// DB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://codex-tufail.vercel.app",
  "https://www.projectcodex.in",
  "https://projectcodex.in",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.options("*", cors());

// ✅ HEALTH CHECK (FIX)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "CodeX API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/projects", adminProjectRoutes);
app.use("/api/free-projects", freeProjectRoutes);
app.use("/api/admin/free-projects", adminFreeProjectRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Server error" });
});

export default app;
