import express from "express";

import {
  sendProjectRequest,
} from "../controllers/projectRequestController.js";

const router = express.Router();

router.post("/", sendProjectRequest);

export default router;