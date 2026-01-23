import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    description: String,
    techStack: [String],
    itemPrices: {
      sourceCode: Number,
      ppt: Number,
      documentation: Number,
    },
    originalPrice: Number,
    price: Number,
    screenshotUrl: String,
    livePreviewUrl: String,
    files: {
      sourceCode: String,
      ppt: String,
      documentation: String,
      fullBundle: String,
    },
  },
  { timestamps: true }
);

// ✅ INDEX (FIX)
projectSchema.index({ createdAt: -1 });
projectSchema.index({ category: 1 });

export default mongoose.model("Project", projectSchema);
