import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser, updateUserLocation, registerPushToken } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);
userRouter.post("/register-push-token", isAuth, registerPushToken);


export default userRouter;
