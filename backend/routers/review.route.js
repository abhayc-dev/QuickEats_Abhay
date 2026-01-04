import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { addReview, getShopReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/add-review", isAuth, upload.array("photos", 5), addReview);
router.get("/shop/:shopId", getShopReviews);

export default router;
