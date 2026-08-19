import mongoose from "mongoose";

const aktuResourceSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    subjectCode: {
      type: String,
      trim: true,
      default: "",
    },

    subjectName: {
      type: String,
      required: true,
      trim: true,
    },

    resourceType: {
      type: String,
      required: true,
      enum: [
        "syllabus",
        "notes",
        "important-questions",
        "pyq",
        "quantum",
        "question-answers",
      ],
    },

    unit: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: Number,
      default: null,
    },

    questionFrequency: {
      type: Number,
      default: 0,
      min: 0,
    },

    priority: {
      type: String,
      enum: ["normal", "important", "very-important"],
      default: "normal",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

aktuResourceSchema.index({
  branch: 1,
  semester: 1,
  resourceType: 1,
});

aktuResourceSchema.index({
  branch: 1,
  semester: 1,
  subjectName: 1,
});

aktuResourceSchema.index({
  createdAt: -1,
});

export default mongoose.model(
  "AktuResource",
  aktuResourceSchema
);