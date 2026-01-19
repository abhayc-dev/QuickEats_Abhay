import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { 
  getAllOrders, 
  getAllShops, 
  getAllUsers, 
  getDashboardStats 
} from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

// Apply auth and admin middleware to all routes
adminRouter.use(isAuth, isAdmin);

adminRouter.get("/dashboard-stats", getDashboardStats);
adminRouter.get("/users", getAllUsers);
adminRouter.get("/shops", getAllShops);
adminRouter.get("/orders", getAllOrders);

export default adminRouter;
