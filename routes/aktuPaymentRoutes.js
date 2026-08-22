import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createAktuPaymentOrder,
  verifyAktuPayment,
} from "../controllers/aktuPaymentController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AKTU PAYMENT ROUTES
|--------------------------------------------------------------------------
| Login is mandatory for both creating and verifying
| an AKTU paid-resource payment.
|--------------------------------------------------------------------------
*/

// Create Razorpay order
router.post(
  "/create-order",
  protect,
  createAktuPaymentOrder
);

// Verify Razorpay payment
router.post(
  "/verify",
  protect,
  verifyAktuPayment
);

export default router;