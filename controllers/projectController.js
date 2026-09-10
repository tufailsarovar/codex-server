import Project from "../models/Project.js";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

/* =========================
   GET ALL PROJECTS
========================= */
export const getAllProjects = async (req, res) => {
  try {
    await connectDB();

    const { category } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    const projects = await Project.find(filter)
      .select(
        "title category description techStack itemPrices originalPrice price screenshotUrl livePreviewUrl createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json(projects);
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};

/* =========================
   GET PROJECT BY ID
========================= */
export const getProjectById = async (req, res) => {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const project = await Project.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error("GET PROJECT BY ID ERROR:", error);

    return res.status(404).json({
      message: "Project not found",
    });
  }
};

/* =========================
   CREATE PROJECT (ADMIN)
========================= */
export const createProject = async (req, res) => {
  try {
    await connectDB();

    const project = await Project.create(req.body);

    return res.status(201).json(project);
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Create project failed",
    });
  }
};

/* =========================
   UPDATE PROJECT (ADMIN)
========================= */
export const updateProject = async (req, res) => {
  try {
    await connectDB();

    let itemPrices = req.body.itemPrices;

    if (typeof itemPrices === "string") {
      itemPrices = JSON.parse(itemPrices);
    }

    let files = req.body.files;

    if (typeof files === "string") {
      files = JSON.parse(files);
    }

    const updatedProject =
      await Project.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          category: req.body.category,
          description: req.body.description,
          techStack: req.body.techStack,
          price: req.body.price,
          originalPrice: req.body.originalPrice,
          screenshotUrl: req.body.screenshotUrl,
          livePreviewUrl: req.body.livePreviewUrl,

          itemPrices: {
            sourceCode: Number(
              itemPrices?.sourceCode || 0
            ),
            ppt: Number(
              itemPrices?.ppt || 0
            ),
            documentation: Number(
              itemPrices?.documentation || 0
            ),
          },

          files: {
            sourceCode:
              files?.sourceCode || "",

            ppt:
              files?.ppt || "",

            documentation:
              files?.documentation || "",

            fullBundle:
              files?.fullBundle || "",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!updatedProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Update project failed",
    });
  }
};

/* =========================
   DELETE PROJECT (ADMIN)
========================= */
export const deleteProject = async (req, res) => {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const project =
      await Project.findByIdAndDelete(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Delete project failed",
    });
  }
};