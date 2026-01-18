import express from "express";
import {
  createFreeProject,
  updateFreeProject,
  deleteFreeProject,
} from "../controllers/adminFreeProjectController.js";

const router = express.Router();

// 🔐 add adminAuth middleware if you already have it
router.post("/", createFreeProject);
router.put("/:id", updateFreeProject);
router.delete("/:id", deleteFreeProject);

export default router;
