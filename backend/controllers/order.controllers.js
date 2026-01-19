import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendOtpToDelivery } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

//! PlaceOrder
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    console.log("PlaceOrder Request:", { paymentMethod, totalAmount, itemCount: cartItems?.length });

    if (!cartItems || cartItems.length == 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "Delivery Address Error" });
    }

    //!   dist. the shop with id and store in array of items in match shop id , shop id is a key
    const groupItemsByShop = {};

    cartItems.forEach((item) => {
      // Ensure shopId is a string
      const shopId = typeof item.shop === 'object' && item.shop !== null 
        ? (item.shop._id || item.shop.toString()) 
        : item.shop;
        
      if (!shopId) {
          console.warn("Item with missing shopId:", item);
          return;
      }

      const shopIdStr = String(shopId);

      if (!groupItemsByShop[shopIdStr]) {
        groupItemsByShop[shopIdStr] = [];
      }
      groupItemsByShop[shopIdStr].push(item);
    });

    //! Api for order details
    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");

        if (!shop || !shop.owner) {
          throw new Error("Shop not found or owner missing: " + shopId);
        }

        const items = groupItemsByShop[shopId];

        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id || i._id, // Handle both id and _id
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      })
    );

    //! logic for RazerPay
    if (paymentMethod == "online") {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
         throw new Error("Razorpay credentials missing in backend environment");
      }
      
      const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorPayOrderId: razorOrder.id,
        payment: false,
      });

      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
      });
    }

    //! create controller of newOrder (For CaseOnDelivery)
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    //! populate the item and shop (to show when user add and then see the items and also shop name)
    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price"
    );
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    //! bring the io from the index.js in app
    const io = req.app.get("io");
    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerId = shopOrder.owner?._id?.toString();
        // console.log(`[Socket Debug] Owner: ${shopOrder.owner.name}, Room: ${ownerId}`);
        if (ownerId) {
          // console.log(`[Socket Debug] Emitting 'newOrder' to Room ${ownerId}`);
          io.to(ownerId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
            status: newOrder.status,
            payment: newOrder.payment,
          });
        } else {
             console.log(`[Socket Debug] No socket ID for owner ${shopOrder.owner.name}`);
        }
      });
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).json({ message: "place order error: " + error.message, error: error.message });
  }
};

//! Verify Payment of RazorPay
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
         throw new Error("Razorpay credentials missing in backend environment");
    }

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status != "captured") {
      return res.status(400).json({ message: "payment field or not captured" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name");

    await order.populate("shopOrders.owner", "name socketId");
    await order.populate("user", "name email mobile");

    //! bring the io from the index.js in app
    const io = req.app.get("io");
    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerId = shopOrder.owner?._id?.toString();
        if (ownerId) {
          io.to(ownerId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            status: order.status,
            payment: order.payment,
          });
        }
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ message: `verify payment error ${error.message}` });
  }
};

//! get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role == "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      //! socketIo use for cod

      return res.status(200).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")
        .populate({
          path: "shopOrders.assignment",
          populate: { path: "broadcastedTo", select: "fullName mobile" },
        });

      //! filter the order -> Burger king receive only own items
      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id == req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        payment: order.payment,
      }));

      return res.status(200).json(filteredOrders);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }
  } catch (error) {
    // console.error("getMyOrders error:", error);  // 👈 ye add kar
    return res
      .status(500)
      .json({ message: `get my order error ${error.message}` });
  }
};

//! logic for to update the status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    const shopOrder = order.shopOrders.find((o) => String(o.shop) === shopId);
    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }

    shopOrder.status = status;

    //! create Payload , keep detail and send to frontend
    let deliveryBoysPayload = [];

    //! logic to notify del.boy for assign , notification get who is under the 5km/5000m
    if (status == "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      console.log("Searching Delivery Boys near:", latitude, longitude);
      console.log("Found:", nearByDeliveryBoys.length, "boys:", nearByDeliveryBoys.map(b => b.fullName));

      //! to filter the deliveryBoy who is free to takeoff the delivery (not send to who is busy)
      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");
      console.log("Busy IDs:", busyIds);
      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );
      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length == 0) {
        await order.save();
        return res.json({
          message:
            "Order Status Updated but there is not available delivery boy",
        });
      }

      //! logic to create delivery Assignment
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      //! to store the assignedTo in assignedDeliveryBoy
      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo || null;

      shopOrder.assignment = deliveryAssignment._id;

      //! set the payload of deliveryBoy
      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");
      await deliveryAssignment.populate({
        path: "order",
        populate: { path: "user", select: "fullName mobile" },
      });

      //! create socket io to send the event , assignment ko send karne ke liye
      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boyId = boy._id.toString();
          if (boyId) {
            io.to(boyId).emit("newAssignment", {
              sendTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items: shopOrder?.shopOrderItems || [],
              subtotal: shopOrder?.subtotal || 0,
              paymentMethod: deliveryAssignment.order.paymentMethod,
              createdAt: deliveryAssignment.createdAt,
              userDetails: deliveryAssignment.order.user
                ? {
                    fullName: deliveryAssignment.order.user.fullName,
                    mobile: deliveryAssignment.order.user.mobile,
                  }
                : null,
              ownerDetails: deliveryAssignment.shop.owner
                ? {
                    fullName: deliveryAssignment.shop.owner.fullName,
                    mobile: deliveryAssignment.shop.owner.mobile,
                  }
                : null,
            });
          }
        });
      }
    }

    await shopOrder.save();
    await order.save();

    //! send the data to particular shop
    const updatedShopOrder = order.shopOrders.find((o) => o.shop == shopId);

    //! populate the shop and assignedDeliveryBoy
    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile"
    );
    await order.populate("user", "socketId");

    //! socket io for update status on user side
    const io = req.app.get("io");
    if (io) {
      const userId = order.user?._id?.toString();
      if (userId) {
        io.to(userId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }

    //! send the data in json formate
    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment?._id || null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `order status error ${error.message}` });
  }
};

// //! logic to get the assignment to particular deliveryBoy
export const getDeliveryBoyAssignments = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    })
      .populate({
        path: "order",
        populate: { path: "user", select: "fullName mobile" },
      })
      .populate({
        path: "shop",
        populate: { path: "owner", select: "fullName mobile" },
      });

    const formatted = assignments.map((a) => {
      const shopOrder = a.order.shopOrders.find((so) =>
        so._id.equals(a.shopOrderId)
      );

      return {
        assignmentId: a._id,
        orderId: a.order._id,
        shopName: a.shop.name,
        deliveryAddress: a.order.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subtotal: shopOrder?.subtotal || 0,
        paymentMethod: a.order.paymentMethod,
        createdAt: a.createdAt,
        // currentDateTime: new Date(), // ✅ current date & time
        userDetails: a.order.user
          ? {
              fullName: a.order.user.fullName,
              mobile: a.order.user.mobile,
            }
          : null,
        ownerDetails: a.shop.owner
          ? {
              fullName: a.shop.owner.fullName,
              mobile: a.shop.owner.mobile,
            }
          : null,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get assignment error ${error.message}` });
  }
};

//! logic for to accept the order by deliveryBoy
export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }

    if (assignment.status != "broadcasted") {
      return res.status(400).json({ message: "assignment not available" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You have already assigned to other order" });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    //! to find the particular order and shopOrder
    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }
    const shopOrder = order.shopOrders.find((so) =>
      so._id.equals(assignment.shopOrderId)
    );
    // shopOrder.assignment = assignment._id;
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();

    //! Populate details for real-time updates
    const deliveryBoy = await User.findById(req.userId);
    await order.populate("user"); // To get user socketId
    await order.populate({
      path: "shopOrders.shop",
      populate: { path: "owner" } // To get owner socketId
    });

    // Re-find the shopOrder because populate modified the structure
    const updatedShopOrder = order.shopOrders.find((so) =>
      so._id.equals(assignment.shopOrderId)
    );

    const io = req.app.get("io");
    if (io) {
      // Notify User
      if (order.user) {
        io.to(order.user._id.toString()).emit("delivery-partner-assigned", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          deliveryBoy: {
            fullName: deliveryBoy.fullName,
            mobile: deliveryBoy.mobile,
          },
        });
      }

      // Notify Owner
      const shopOwner = updatedShopOrder.shop?.owner;
      if (shopOwner) {
        io.to(shopOwner._id.toString()).emit("assignment-accepted", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          deliveryBoy: {
            _id: deliveryBoy._id,
            fullName: deliveryBoy.fullName,
            mobile: deliveryBoy.mobile,
          },
        });
      }
    }

    return res.status(200).json({ message: "Order Accepted Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `accept order error ${error.message}` });
  }
};

//! logic to reject the order by deliveryBoy
export const rejectAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.userId;

    const assignment = await DeliveryAssignment.findByIdAndUpdate(
      assignmentId,
      {
        $pull: { broadcastedTo: userId },
        $addToSet: { rejectedBy: userId },
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res
      .status(200)
      .json({ message: "Assignment rejected successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `reject assignment error ${error.message}` });
  }
};

//! Logic to get the current Order to display in deliveryBoy interface
export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName mobile email location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName mobile email location" }],
      });

    if (!assignment) {
      return res.status(400).json({ message: "No current order found" });
    }

    if (!assignment.order) {
      return res.status(400).json({ message: "Order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId)
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "Shop order not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates?.length == 2) {
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates?.[0];
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates?.[1];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
    }

    return res.status(200).json({
      orderId: assignment.order._id,
      user: assignment.order.user,
      shop: assignment.shop,
      items: shopOrder.shopOrderItems,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
      paymentMethod: assignment.order.paymentMethod,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get current order error ${error.message}` });
  }
};

//! Controller for customer to track the order status by orderId
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .populate("shopOrders.owner", "fullName email mobile")
      .populate(
        "shopOrders.assignedDeliveryBoy",
        "fullName mobile email location"
      )
      .lean();

    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get order by id error ${error.message}` });
  }
};

//! logic to write the function of delivery OTP
export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders?.id(shopOrderId);
    if (!shopOrder || !order) {
      return res.status(400).json({ message: "Shop order/ order not found" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();

    if (!order.user) {
       return res.status(400).json({ message: "Customer user not found (deleted?)" });
    }

    let emailStatus = "sent";
    try {
      await sendOtpToDelivery(order.user, otp);
    } catch (mailError) {
      console.error("Email delivery failed:", mailError);
      emailStatus = "failed";
    }

    return res.status(200).json({
      message: emailStatus === "sent" 
        ? `OTP sent to ${order?.user?.fullName}` 
        : `OTP Generated. Email Failed (Check Track Order Page).`,
      email: order?.user?.email,
      emailStatus
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `send delivery otp error ${error.message}` });
  }
};

//! logic to verify the delivery OTP and shopOrder.status = delivered and delete the delivery assignment
export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder || !order) {
      return res.status(400).json({ message: "Shop order/ order not found" });
    }
    if (!shopOrder.deliveryOtp || !shopOrder.otpExpires) {
      return res.status(400).json({ message: "OTP not generated" });
    }
    if (shopOrder.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    if (shopOrder.deliveryOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = new Date();
    await order.save();

    //! delete the delivery assignment
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    // notify user and owner about delivery completion instantly
    const io = req.app.get("io");
    if (io) {
      // notify user
      await order.populate("user", "socketId");
      const userId = order.user?._id.toString();
      if (userId) {
        io.to(userId).emit("orderDelivered", {
          orderId: order._id,
          shopOrderId: shopOrder._id,
          shopId: shopOrder.shop,
          status: shopOrder.status,
        });
      }

      // notify owner
      await order.populate("shopOrders.owner", "socketId");
      const ownerEntry = order.shopOrders.find((so) => String(so._id) === String(shopOrder._id));
      const ownerId = ownerEntry?.owner?._id?.toString();
      if (ownerId) {
        io.to(ownerId).emit("orderDelivered", {
          orderId: order._id,
          shopOrderId: shopOrder._id,
          shopId: shopOrder.shop,
          status: shopOrder.status,
        });
      }
    }

    return res
      .status(200)
      .json({ message: "OTP verified and order delivered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `verify delivery otp error ${error.message}` });
  }
};

//! Order bar graph for DeliveryBoy start from night 12
export const getTodaysDeliveries = async (req, res) => {
  try {
    const DeliveryBoyId = req.userId;
    const startOfDays = new Date();
    startOfDays.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": DeliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startOfDays },
    }).lean();

    let todaysDeliveries = [];
    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          shopOrder.assignedDeliveryBoy == DeliveryBoyId &&
          shopOrder.status == "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startOfDays
        ) {
          todaysDeliveries.push(shopOrder);
        }
      });
    });

    let stats = {};
    todaysDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));

    formattedStats.sort((a, b) => a.hour - b.hour);

    return res.status(200).json(formattedStats);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `todays delivery error ${error.message}` });
  }
};
