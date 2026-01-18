import express from "express";
import {
  getFreeProjects,
  getFreeProjectById,
} from "../controllers/freeProjectController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getFreeProjects);

// ADMIN — EDIT PAGE
router.get("/:id", protect, adminOnly, getFreeProjectById);

export default router;
