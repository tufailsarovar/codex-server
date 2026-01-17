import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    paymentProvider: { type: String, default: "mock" },
    paymentId: { type: String },
    invoiceUrl: { type: String } // could be a generated PDF link later
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
