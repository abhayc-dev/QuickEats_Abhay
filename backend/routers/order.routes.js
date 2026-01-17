import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignments, getMyOrders, getOrderById, getTodaysDeliveries, placeOrder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOtp, verifyPayment, rejectAssignment } from "../controllers/order.controllers.js";


const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignments)
orderRouter.get("/get-current-order", isAuth, getCurrentOrder)
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.put("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.put("/reject-assignment/:assignmentId", isAuth, rejectAssignment);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.get("/get-todays-deliveries", isAuth, getTodaysDeliveries);

export default orderRouter;
