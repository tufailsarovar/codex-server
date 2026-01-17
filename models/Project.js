import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },

    techStack: [{ type: String }],

    // 🔥 MUST MATCH PAYLOAD EXACTLY
    itemPrices: {
      sourceCode: { type: Number, default: 0 },
      ppt: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
    },

    originalPrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 },

    screenshotUrl: String,
    livePreviewUrl: String,

    files: {
      sourceCode: { type: String, default: "" },
      ppt: { type: String, default: "" },
      documentation: { type: String, default: "" },
      fullBundle: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    strict: true, // IMPORTANT
  }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
