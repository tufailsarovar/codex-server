import AktuResource from "../models/AKTUResource.js";

/* =========================
   PUBLIC — GET AKTU RESOURCES
========================= */

export const getAktuResources = async (req, res) => {
  try {
    const {
      branch,
      semester,
      resourceType,
      subjectName,
    } = req.query;

    const filter = {
      isPublished: true,
    };

    if (branch) {
      filter.branch = branch;
    }

    if (semester) {
      filter.semester = Number(semester);
    }

    if (resourceType) {
      filter.resourceType = resourceType;
    }

    if (subjectName) {
      filter.subjectName = subjectName;
    }

    const resources = await AktuResource.find(filter)
      .sort({
        semester: 1,
        subjectName: 1,
        resourceType: 1,
        createdAt: -1,
      })
      .lean();

    res.status(200).json(resources);
  } catch (error) {
    console.error("Get AKTU resources error:", error);

    res.status(500).json({
      message: "Failed to load AKTU resources",
    });
  }
};

/* =========================
   PUBLIC — GET SINGLE RESOURCE
========================= */

export const getAktuResourceById = async (req, res) => {
  try {
    const resource = await AktuResource.findOne({
      _id: req.params.id,
      isPublished: true,
    }).lean();

    if (!resource) {
      return res.status(404).json({
        message: "AKTU resource not found",
      });
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error(
      "Get AKTU resource by ID error:",
      error
    );

    res.status(500).json({
      message: "Failed to load AKTU resource",
    });
  }
};

/* =========================
   ADMIN — GET ALL RESOURCES
========================= */

export const getAllAktuResources = async (req, res) => {
  try {
    const resources = await AktuResource.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    res.status(200).json(resources);
  } catch (error) {
    console.error(
      "Get all AKTU resources error:",
      error
    );

    res.status(500).json({
      message: "Failed to load AKTU resources",
    });
  }
};

/* =========================
   ADMIN — CREATE RESOURCE
========================= */

export const createAktuResource = async (req, res) => {
  try {
    const {
      branch,
      semester,
      subjectCode,
      subjectName,
      resourceType,
      unit,
      title,
      description,
      content,
      imageUrl,
      fileUrl,
      imagePublicId,
      filePublicId,
      year,
      questionFrequency,
      priority,
      isPublished,
    } = req.body;

    if (
      !branch ||
      !semester ||
      !subjectName ||
      !resourceType ||
      !title
    ) {
      return res.status(400).json({
        message:
          "Branch, semester, subject name, resource type and title are required",
      });
    }

    const resource = await AktuResource.create({
      branch: branch.trim(),

      semester: Number(semester),

      subjectCode:
        subjectCode?.trim() || "",

      subjectName:
        subjectName.trim(),

      resourceType,

      unit:
        unit?.trim() || "",

      title:
        title.trim(),

      description:
        description?.trim() || "",

      content:
        content || "",

      imageUrl:
        imageUrl?.trim() || "",

      fileUrl:
        fileUrl?.trim() || "",

      imagePublicId:
        imagePublicId?.trim() || "",

      filePublicId:
        filePublicId?.trim() || "",

      year:
        year !== undefined &&
        year !== null &&
        year !== ""
          ? Number(year)
          : null,

      questionFrequency:
        questionFrequency !== undefined &&
        questionFrequency !== null &&
        questionFrequency !== ""
          ? Number(questionFrequency)
          : 0,

      priority:
        priority || "normal",

      isPublished:
        typeof isPublished === "boolean"
          ? isPublished
          : true,
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error(
      "Create AKTU resource error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to create AKTU resource",
    });
  }
};

/* =========================
   ADMIN — UPDATE RESOURCE
========================= */

export const updateAktuResource = async (req, res) => {
  try {
    const resource =
      await AktuResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "AKTU resource not found",
      });
    }

    const {
      branch,
      semester,
      subjectCode,
      subjectName,
      resourceType,
      unit,
      title,
      description,
      content,
      imageUrl,
      fileUrl,
      imagePublicId,
      filePublicId,
      year,
      questionFrequency,
      priority,
      isPublished,
    } = req.body;

    if (branch !== undefined) {
      resource.branch =
        branch.trim();
    }

    if (semester !== undefined) {
      resource.semester =
        Number(semester);
    }

    if (subjectCode !== undefined) {
      resource.subjectCode =
        subjectCode?.trim() || "";
    }

    if (subjectName !== undefined) {
      resource.subjectName =
        subjectName.trim();
    }

    if (resourceType !== undefined) {
      resource.resourceType =
        resourceType;
    }

    if (unit !== undefined) {
      resource.unit =
        unit?.trim() || "";
    }

    if (title !== undefined) {
      resource.title =
        title.trim();
    }

    if (description !== undefined) {
      resource.description =
        description?.trim() || "";
    }

    if (content !== undefined) {
      resource.content =
        content || "";
    }

    if (imageUrl !== undefined) {
      resource.imageUrl =
        imageUrl?.trim() || "";
    }

    if (fileUrl !== undefined) {
      resource.fileUrl =
        fileUrl?.trim() || "";
    }

    if (imagePublicId !== undefined) {
      resource.imagePublicId =
        imagePublicId?.trim() || "";
    }

    if (filePublicId !== undefined) {
      resource.filePublicId =
        filePublicId?.trim() || "";
    }

    if (year !== undefined) {
      resource.year =
        year === "" || year === null
          ? null
          : Number(year);
    }

    if (questionFrequency !== undefined) {
      resource.questionFrequency =
        questionFrequency === "" ||
        questionFrequency === null
          ? 0
          : Number(questionFrequency);
    }

    if (priority !== undefined) {
      resource.priority =
        priority;
    }

    if (isPublished !== undefined) {
      resource.isPublished =
        Boolean(isPublished);
    }

    await resource.save();

    res.status(200).json(resource);
  } catch (error) {
    console.error(
      "Update AKTU resource error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to update AKTU resource",
    });
  }
};

/* =========================
   ADMIN — DELETE RESOURCE
========================= */

export const deleteAktuResource = async (req, res) => {
  try {
    const resource =
      await AktuResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "AKTU resource not found",
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      message:
        "AKTU resource deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete AKTU resource error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete AKTU resource",
    });
  }
};