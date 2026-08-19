import express from "express";

import upload from "../middleware/upload.middleware.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

import {
  uploadAktuImage,
  uploadAktuPdf,
} from "../controllers/upload.controller.js";

const router = express.Router();

router.post(
  "/aktu/image",
  protect,
  adminOnly,
  upload.single("image"),
  uploadAktuImage
);

router.post(
  "/aktu/pdf",
  protect,
  adminOnly,
  upload.single("pdf"),
  uploadAktuPdf
);

export default router;