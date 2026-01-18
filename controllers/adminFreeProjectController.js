import FreeProject from "../models/FreeProject.js";

/* ADD FREE PROJECT */
export const createFreeProject = async (req, res) => {
  try {
    const project = await FreeProject.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to create free project" });
  }
};

/* UPDATE FREE PROJECT */
export const updateFreeProject = async (req, res) => {
  try {
    const project = await FreeProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* DELETE FREE PROJECT */
export const deleteFreeProject = async (req, res) => {
  try {
    await FreeProject.findByIdAndDelete(req.params.id);
    res.json({ message: "Free project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
