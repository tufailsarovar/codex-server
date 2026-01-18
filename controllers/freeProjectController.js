import FreeProject from "../models/FreeProject.js";
import mongoose from "mongoose";

// GET ALL FREE PROJECTS
export const getFreeProjects = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }

    const projects = await FreeProject.find()
      .sort({ createdAt: -1 })
      .lean();

    res.set("Cache-Control", "public, max-age=60");
    res.json(projects);
  } catch (err) {
    res.json([]);
  }
};

// GET SINGLE FREE PROJECT BY ID (FOR EDIT)
export const getFreeProjectById = async (req, res) => {
  try {
    const project = await FreeProject.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({});
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({});
  }
};
