import express from "express";

import upload from "../middlewares/upload.middleware.js";

import adminAuth from "../middlewares/adminAuth.middleware.js";

import {
  uploadAktuImage,
  uploadAktuPdf,
} from "../controllers/upload.controller.js";

const router = express.Router();

/* =========================
   AKTU IMAGE
========================= */

router.post(
  "/aktu/image",
  adminAuth,
  upload.single("image"),
  uploadAktuImage
);

/* =========================
   AKTU PDF
========================= */

router.post(
  "/aktu/pdf",
  adminAuth,
  upload.single("pdf"),
  uploadAktuPdf
);

export default router;