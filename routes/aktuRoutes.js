import express from "express";

import {
  getAktuResources,
  getAktuResourceById,
} from "../controllers/aktuController.js";

const router = express.Router();

/* PUBLIC — GET AKTU RESOURCES */
router.get("/", getAktuResources);

/* PUBLIC — GET SINGLE RESOURCE */
router.get("/:id", getAktuResourceById);

export default router;