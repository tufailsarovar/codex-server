import mongoose from "mongoose";

const freeProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    githubLink: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    techStack: [String],
  },
  { timestamps: true }
);

export default mongoose.model("FreeProject", freeProjectSchema);
