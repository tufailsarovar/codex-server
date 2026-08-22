import express from "express";

import {
  getAktuResources,
  getAktuResourceById,
  getAllAktuResources,
  createAktuResource,
  updateAktuResource,
  deleteAktuResource,
} from "../controllers/aktuController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC AKTU ROUTES
|--------------------------------------------------------------------------
*/

/*
 * IMPORTANT:
 * Keep /public BEFORE /:id.
 *
 * Otherwise Express can treat "public"
 * as an ID and Mongoose will try to
 * convert "public" into ObjectId.
 */

router.get(
  "/public",
  getAktuResources
);

router.get(
  "/public/:id",
  getAktuResourceById
);


/*
|--------------------------------------------------------------------------
| ADMIN AKTU ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  adminOnly,
  getAllAktuResources
);

router.post(
  "/",
  protect,
  adminOnly,
  createAktuResource
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateAktuResource
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteAktuResource
);

export default router;