import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
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

console.log("MONGO_URI from env:", process.env.MONGO_URI?.slice(0, 40) + "...");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// DB
connectDB();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://codex-tufail.vercel.app",
  "https://www.projectcodex.in",
  "https://projectcodex.in"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT: allow preflight requests
app.options("*", cors());


// Routes
app.get("/", (req, res) => {
  res.json({ message: "CodeX API running" });
});
app.use(express.json());
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
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
