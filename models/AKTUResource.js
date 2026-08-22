import mongoose from "mongoose";

const aktuResourceSchema = new mongoose.Schema(
  {
    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    academicYear: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
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

    // =====================================================
    // UNIT
    //
    // Used only for paid resources.
    // Example:
    // Unit 1
    // Unit 2
    // =====================================================

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // DESCRIPTION
    //
    // Syllabus:
    // optional short description
    //
    // Paid:
    // unit name / description
    // =====================================================

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // FRONT PAGE IMAGE
    //
    // Used only for paid resources.
    // Google Drive image URL.
    // =====================================================

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // PDF
    //
    // Google Drive PDF URL.
    // =====================================================

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // ACCESS TYPE
    //
    // Syllabus = ALWAYS free
    //
    // All other resource types = paid
    // =====================================================

    accessType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },

    // =====================================================
    // PRICE
    //
    // Syllabus = ALWAYS 0
    //
    // Paid resources = greater than 0
    // =====================================================

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =====================================================
    // PUBLISH
    // =====================================================

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// NORMALIZE ACCESS / PRICE BEFORE SAVE
// =========================================================

aktuResourceSchema.pre(
  "save",
  function (next) {
    /*
     * Syllabus is always free.
     */
    if (
      this.resourceType ===
      "syllabus"
    ) {
      this.accessType =
        "free";

      this.price = 0;

      this.unit = "";

      this.imageUrl = "";
    } else {
      /*
       * Every other AKTU resource is paid.
       */
      this.accessType =
        "paid";

      /*
       * Paid resources must have
       * a positive price.
       */
      if (
        !Number.isFinite(
          Number(this.price)
        ) ||
        Number(this.price) <= 0
      ) {
        return next(
          new Error(
            "Paid AKTU resources must have a price greater than 0."
          )
        );
      }
    }

    next();
  }
);

// =========================================================
// VALIDATION FOR UPDATE OPERATIONS
// =========================================================

aktuResourceSchema.pre(
  "findOneAndUpdate",
  function (next) {
    const update =
      this.getUpdate() || {};

    /*
     * Handle MongoDB $set updates.
     */
    const data =
      update.$set || update;

    /*
     * If resource type is explicitly
     * being changed to syllabus.
     */
    if (
      data.resourceType ===
      "syllabus"
    ) {
      if (update.$set) {
        update.$set.accessType =
          "free";

        update.$set.price = 0;

        update.$set.unit = "";

        update.$set.imageUrl = "";
      } else {
        update.accessType =
          "free";

        update.price = 0;

        update.unit = "";

        update.imageUrl = "";
      }
    }

    /*
     * If a non-syllabus resource is
     * being updated and price exists,
     * force paid access.
     */
    if (
      data.resourceType &&
      data.resourceType !==
        "syllabus"
    ) {
      if (update.$set) {
        update.$set.accessType =
          "paid";
      } else {
        update.accessType =
          "paid";
      }
    }

    this.setUpdate(update);

    next();
  }
);

// =========================================================
// INDEXES
// =========================================================

aktuResourceSchema.index({
  branch: 1,
  academicYear: 1,
  resourceType: 1,
});

aktuResourceSchema.index({
  resourceType: 1,
  isPublished: 1,
});

aktuResourceSchema.index({
  accessType: 1,
  isPublished: 1,
});

aktuResourceSchema.index({
  createdAt: -1,
});

// =========================================================
// MODEL
// =========================================================

export default mongoose.model(
  "AktuResource",
  aktuResourceSchema
);