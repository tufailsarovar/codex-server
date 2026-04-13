import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      min: [6, "Password must be at least 6 characters long"],
      max: [24, "Password must be at most 24 characters long"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Admin", adminSchema);
