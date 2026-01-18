import Project from "../models/Project.js";
import mongoose from "mongoose";

/* =========================
   GET ALL PROJECTS
========================= */
export const getAllProjects = async (req, res) => {
  try {
    // ✅ prevent crash if DB not connected yet (serverless cold start)
    if (mongoose.connection.readyState !== 1) {
      return res.json([]); // return empty list instead of 500
    }

    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.set("Cache-Control", "public, max-age=60");
    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.json([]); // ✅ never throw 500 to frontend
  }
};

/* =========================
   GET PROJECT BY ID
========================= */
export const getProjectById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(id).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(404).json({ message: "Project not found" });
  }
};

/* =========================
   CREATE PROJECT (ADMIN)
========================= */
export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
};

/* =========================
   UPDATE PROJECT (ADMIN)
========================= */
export const updateProject = async (req, res) => {
  try {
    let itemPrices = req.body.itemPrices;
    if (typeof itemPrices === "string") itemPrices = JSON.parse(itemPrices);

    let files = req.body.files;
    if (typeof files === "string") files = JSON.parse(files);

    const updatedProject = await Project.findByIdAndUpdate(
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
          sourceCode: Number(itemPrices?.sourceCode || 0),
          ppt: Number(itemPrices?.ppt || 0),
          documentation: Number(itemPrices?.documentation || 0),
        },
        files: {
          sourceCode: files?.sourceCode || "",
          ppt: files?.ppt || "",
          documentation: files?.documentation || "",
          fullBundle: files?.fullBundle || "",
        },
      },
      { new: true }
    );

    res.json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Project update failed" });
  }
};

/* =========================
   DELETE PROJECT (ADMIN)
========================= */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
};
