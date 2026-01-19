import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import Item from "../models/item.model.js";

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalItems = await Item.countDocuments();

    // Calculate total revenue (assuming 'totalPrice' in Order model)
    const deliveredOrders = await Order.find({ status: "Delivered" }); // Only count delivered orders
    
    const totalRevenue = deliveredOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    return res.status(200).json({
      totalUsers,
      totalShops,
      totalOrders,
      totalItems,
      totalRevenue,
    });
  } catch (error) {
    return res.status(500).json({ error: `getDashboardStats error: ${error.message}` });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: `getAllUsers error: ${error.message}` });
  }
};

// Get all shops
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate("owner", "fullName email").sort({ createdAt: -1 });
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ error: `getAllShops error: ${error.message}` });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "fullName email")
      .populate("shopId", "shopName")
      .sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: `getAllOrders error: ${error.message}` });
  }
};
