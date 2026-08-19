import express from "express";

import {
  getAllAktuResources,
  createAktuResource,
  updateAktuResource,
  deleteAktuResource,
} from "../controllers/aktuController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ADMIN — GET ALL AKTU RESOURCES */
router.get(
  "/",
  protect,
  adminOnly,
  getAllAktuResources
);

/* ADMIN — CREATE AKTU RESOURCE */
router.post(
  "/",
  protect,
  adminOnly,
  createAktuResource
);

/* ADMIN — UPDATE AKTU RESOURCE */
router.put(
  "/:id",
  protect,
  adminOnly,
  updateAktuResource
);

/* ADMIN — DELETE AKTU RESOURCE */
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteAktuResource
);

export default router;