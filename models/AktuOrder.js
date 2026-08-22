import mongoose from "mongoose";

const aktuOrderSchema = new mongoose.Schema(
  {
    // =====================================================
    // USER WHO PURCHASED THE RESOURCE
    // =====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // AKTU RESOURCE
    // =====================================================

    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AktuResource",
      required: true,
    },

    // =====================================================
    // AMOUNT PAID
    // =====================================================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
      ],
      default: "pending",
    },

    // =====================================================
    // PAYMENT PROVIDER
    // =====================================================

    paymentProvider: {
      type: String,
      enum: [
        "razorpay",
      ],
      default: "razorpay",
    },

    // =====================================================
    // RAZORPAY PAYMENT ID
    // =====================================================

    paymentId: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // RAZORPAY ORDER ID
    // =====================================================

    razorpayOrderId: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // EMAIL DELIVERY STATUS
    // =====================================================

    emailSent: {
      type: Boolean,
      default: false,
    },

    emailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEXES
// =========================================================

aktuOrderSchema.index({
  user: 1,
  createdAt: -1,
});

aktuOrderSchema.index({
  resource: 1,
});

aktuOrderSchema.index({
  paymentId: 1,
  unique: true,
});

aktuOrderSchema.index({
  razorpayOrderId: 1,
});

aktuOrderSchema.index({
  paymentStatus: 1,
});

// =========================================================
// MODEL
// =========================================================

const AktuOrder =
  mongoose.model(
    "AktuOrder",
    aktuOrderSchema
  );

export default AktuOrder;