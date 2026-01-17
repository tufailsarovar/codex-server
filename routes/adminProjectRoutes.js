import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

/* CREATE PROJECT */
router.post("/", protect, adminOnly, createProject);

/* UPDATE PROJECT */
router.put("/:id", protect, adminOnly, updateProject);

/* DELETE PROJECT */
router.delete("/:id", protect, adminOnly, deleteProject);

export default router;
