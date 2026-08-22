import mongoose from "mongoose";
import AktuResource from "../models/AKTUResource.js";

/* =========================================================
   HELPERS
========================================================= */

const RESOURCE_TYPES = [
  "syllabus",
  "notes",
  "important-questions",
  "pyq",
  "quantum",
  "question-answers",
];

const isValidResourceType = (
  resourceType
) => {
  return RESOURCE_TYPES.includes(
    resourceType
  );
};

const getAcademicYear = (
  academicYear
) => {
  const year = Number(
    academicYear
  );

  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 4
  ) {
    return null;
  }

  return year;
};

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/* =========================================================
   PUBLIC — GET AKTU RESOURCES
========================================================= */

export const getAktuResources = async (
  req,
  res
) => {
  try {
    const {
      branch,
      academicYear,
      resourceType,
    } = req.query;

    console.log(
      "================================"
    );

    console.log(
      "AKTU PUBLIC REQUEST"
    );

    console.log(
      "Query:",
      req.query
    );

    const filter = {
      isPublished: true,
    };

    if (branch) {
      filter.branch =
        String(branch).trim();
    }

    if (
      academicYear !== undefined &&
      academicYear !== ""
    ) {
      const year =
        getAcademicYear(
          academicYear
        );

      if (!year) {
        return res.status(400).json({
          message:
            "Invalid academic year.",
        });
      }

      filter.academicYear =
        year;
    }

    if (resourceType) {
      const type =
        String(resourceType)
          .trim()
          .toLowerCase();

      if (
        !isValidResourceType(
          type
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid AKTU resource type.",
        });
      }

      filter.resourceType =
        type;
    }

    console.log(
      "AKTU FILTER:",
      filter
    );

    const resources =
      await AktuResource.find(
        filter
      )
        .sort({
          academicYear: 1,
          resourceType: 1,
          createdAt: -1,
        })
        .lean();

    console.log(
      "AKTU RESOURCES FOUND:",
      resources.length
    );

    console.log(
      "================================"
    );

    return res.status(200).json(
      resources
    );
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "AKTU PUBLIC API ERROR:"
    );

    console.error(error);

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "================================"
    );

    return res.status(500).json({
      message:
        "Failed to load AKTU resources.",

      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

/* =========================================================
   PUBLIC — GET SINGLE AKTU RESOURCE
========================================================= */

export const getAktuResourceById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      /*
       * IMPORTANT:
       * Never send an invalid value
       * to Mongoose findById/findOne.
       */

      if (
        !id ||
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid AKTU resource ID.",
        });
      }

      const resource =
        await AktuResource.findOne({
          _id: id,
          isPublished: true,
        }).lean();

      if (!resource) {
        return res.status(404).json({
          message:
            "AKTU resource not found.",
        });
      }

      return res.status(200).json(
        resource
      );
    } catch (error) {
      console.error(
        "Get AKTU resource error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load AKTU resource.",
      });
    }
  };

/* =========================================================
   ADMIN — GET ALL
========================================================= */

export const getAllAktuResources =
  async (req, res) => {
    try {
      const resources =
        await AktuResource.find({})
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json(
        resources
      );
    } catch (error) {
      console.error(
        "Get all AKTU resources error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load AKTU resources.",
      });
    }
  };

/* =========================================================
   ADMIN — CREATE
========================================================= */

export const createAktuResource =
  async (req, res) => {
    try {
      const {
        branch,
        academicYear,
        resourceType,
        unit,
        description,
        imageUrl,
        fileUrl,
        price,
        isPublished,
      } = req.body;

      /* -------------------------
         REQUIRED BASIC FIELDS
      ------------------------- */

      if (!branch?.trim()) {
        return res.status(400).json({
          message:
            "Branch is required.",
        });
      }

      if (
        academicYear ===
          undefined ||
        academicYear === null ||
        academicYear === ""
      ) {
        return res.status(400).json({
          message:
            "Academic year is required.",
        });
      }

      if (!resourceType) {
        return res.status(400).json({
          message:
            "Resource type is required.",
        });
      }

      const normalizedType =
        String(resourceType)
          .trim()
          .toLowerCase();

      if (
        !isValidResourceType(
          normalizedType
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid AKTU resource type.",
        });
      }

      if (!fileUrl?.trim()) {
        return res.status(400).json({
          message:
            "PDF link is required.",
        });
      }

      if (
        !isValidUrl(
          fileUrl.trim()
        )
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid PDF URL.",
        });
      }

      /* -------------------------
         YEAR
      ------------------------- */

      const year =
        getAcademicYear(
          academicYear
        );

      if (!year) {
        return res.status(400).json({
          message:
            "Academic year must be between 1 and 4.",
        });
      }

      /* -------------------------
         SYLLABUS
         ALWAYS FREE
      ------------------------- */

      const isSyllabus =
        normalizedType ===
        "syllabus";

      if (isSyllabus) {
        const resource =
          await AktuResource.create({
            branch:
              branch.trim(),

            academicYear:
              year,

            resourceType:
              normalizedType,

            unit: "",

            description:
              description
                ?.trim() || "",

            imageUrl: "",

            fileUrl:
              fileUrl.trim(),

            accessType:
              "free",

            price: 0,

            isPublished:
              typeof isPublished ===
              "boolean"
                ? isPublished
                : true,
          });

        return res.status(201).json(
          resource
        );
      }

      /* -------------------------
         PAID RESOURCE
      ------------------------- */

      if (!unit?.trim()) {
        return res.status(400).json({
          message:
            "Unit number is required for paid resources.",
        });
      }

      if (!description?.trim()) {
        return res.status(400).json({
          message:
            "Unit name / description is required for paid resources.",
        });
      }

      if (!imageUrl?.trim()) {
        return res.status(400).json({
          message:
            "Front page image link is required for paid resources.",
        });
      }

      if (
        !isValidUrl(
          imageUrl.trim()
        )
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid image URL.",
        });
      }

      const finalPrice =
        Number(price);

      if (
        !Number.isFinite(
          finalPrice
        ) ||
        finalPrice <= 0
      ) {
        return res.status(400).json({
          message:
            "Paid resources require a price greater than ₹0.",
        });
      }

      const resource =
  await AktuResource.create({
    branch: branch.trim(),

    academicYear: year,

    resourceType,

    unit: isSyllabus
      ? ""
      : unit?.trim() || "",

    description:
      description?.trim() || "",

    imageUrl: isSyllabus
      ? ""
      : imageUrl?.trim() || "",

    fileUrl:
      fileUrl.trim(),

    accessType:
      isSyllabus
        ? "free"
        : "paid",

    price:
      finalPrice,

    isPublished:
      typeof isPublished ===
      "boolean"
        ? isPublished
        : true,
  });

      return res.status(201).json(
        resource
      );
    } catch (error) {
      console.error(
        "Create AKTU resource error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to create AKTU resource.",
      });
    }
  };

/* =========================================================
   ADMIN — UPDATE
========================================================= */

export const updateAktuResource =
  async (req, res) => {
    try {
      const resource =
        await AktuResource.findById(
          req.params.id
        );

      if (!resource) {
        return res.status(404).json({
          message:
            "AKTU resource not found.",
        });
      }

      const {
        branch,
        academicYear,
        resourceType,
        unit,
        description,
        imageUrl,
        fileUrl,
        price,
        isPublished,
      } = req.body;

      /* -------------------------
         BRANCH
      ------------------------- */

      if (branch !== undefined) {
        if (!branch?.trim()) {
          return res.status(400).json({
            message:
              "Branch is required.",
          });
        }

        resource.branch =
          branch.trim();
      }

      /* -------------------------
         ACADEMIC YEAR
      ------------------------- */

      if (
        academicYear !==
        undefined
      ) {
        const year =
          getAcademicYear(
            academicYear
          );

        if (!year) {
          return res.status(400).json({
            message:
              "Academic year must be between 1 and 4.",
          });
        }

        resource.academicYear =
          year;
      }

      /* -------------------------
         RESOURCE TYPE
      ------------------------- */

      if (
        resourceType !==
        undefined
      ) {
        const normalizedType =
          String(resourceType)
            .trim()
            .toLowerCase();

        if (
          !isValidResourceType(
            normalizedType
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid AKTU resource type.",
          });
        }

        resource.resourceType =
          normalizedType;
      }

      const finalResourceType =
        resource.resourceType;

      const isSyllabus =
        finalResourceType ===
        "syllabus";

      /* -------------------------
         PDF
      ------------------------- */

      if (
        fileUrl !== undefined
      ) {
        if (!fileUrl?.trim()) {
          return res.status(400).json({
            message:
              "PDF link is required.",
          });
        }

        if (
          !isValidUrl(
            fileUrl.trim()
          )
        ) {
          return res.status(400).json({
            message:
              "Please enter a valid PDF URL.",
          });
        }

        resource.fileUrl =
          fileUrl.trim();
      }

      /* -------------------------
         SYLLABUS
      ------------------------- */

      if (isSyllabus) {
        resource.accessType =
          "free";

        resource.price = 0;

        resource.unit = "";

        resource.imageUrl = "";

        if (
          description !==
          undefined
        ) {
          resource.description =
            description?.trim() ||
            "";
        }
      } else {
        /* -----------------------
           PAID RESOURCE
        ----------------------- */

        if (
          unit !== undefined
        ) {
          if (!unit?.trim()) {
            return res.status(400).json({
              message:
                "Unit number is required for paid resources.",
            });
          }

          resource.unit =
            unit.trim();
        }

        if (
          description !==
          undefined
        ) {
          if (!description?.trim()) {
            return res.status(400).json({
              message:
                "Unit name / description is required for paid resources.",
            });
          }

          resource.description =
            description.trim();
        }

        if (
          imageUrl !==
          undefined
        ) {
          if (!imageUrl?.trim()) {
            return res.status(400).json({
              message:
                "Front page image link is required for paid resources.",
            });
          }

          if (
            !isValidUrl(
              imageUrl.trim()
            )
          ) {
            return res.status(400).json({
              message:
                "Please enter a valid image URL.",
            });
          }

          resource.imageUrl =
            imageUrl.trim();
        }

        if (
          price !== undefined
        ) {
          const finalPrice =
            Number(price);

          if (
            !Number.isFinite(
              finalPrice
            ) ||
            finalPrice <= 0
          ) {
            return res.status(400).json({
              message:
                "Paid resources require a price greater than ₹0.",
            });
          }

          resource.price =
            finalPrice;
        }

        if (
          !Number.isFinite(
            Number(
              resource.price
            )
          ) ||
          Number(
            resource.price
          ) <= 0
        ) {
          return res.status(400).json({
            message:
              "Paid resources require a price greater than ₹0.",
          });
        }

        resource.accessType =
          "paid";
      }

      /* -------------------------
         PUBLISHED
      ------------------------- */

      if (
        isPublished !==
        undefined
      ) {
        resource.isPublished =
          Boolean(
            isPublished
          );
      }

      await resource.save();

      return res.status(200).json(
        resource
      );
    } catch (error) {
      console.error(
        "Update AKTU resource error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to update AKTU resource.",
      });
    }
  };

/* =========================================================
   ADMIN — DELETE
========================================================= */

export const deleteAktuResource =
  async (req, res) => {
    try {
      const resource =
        await AktuResource.findById(
          req.params.id
        );

      if (!resource) {
        return res.status(404).json({
          message:
            "AKTU resource not found.",
        });
      }

      await resource.deleteOne();

      return res.status(200).json({
        success: true,

        message:
          "AKTU resource deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete AKTU resource error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete AKTU resource.",
      });
    }
  };