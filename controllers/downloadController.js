import Project  from "../models/Project.js";
import { Order } from "../models/Order.js";

export const downloadProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // code | ppt | docs | all
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // FREE PROJECT
    if (project.price === 0) {
      return res.json({ downloadUrl: getFile(project, type) });
    }

    const order = await Order.findOne({
      user: userId,
      project: id,
      paymentStatus: "paid"
    });

    if (!order) {
      return res.status(403).json({ message: "Purchase required" });
    }

    res.json({ downloadUrl: getFile(project, type) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Download failed" });
  }
};

const getFile = (project, type) => {
  switch (type) {
    case "code":
      return project.files.sourceCode;
    case "ppt":
      return project.files.ppt;
    case "docs":
      return project.files.documentation;
    default:
      return project.files.fullBundle;
  }
};
