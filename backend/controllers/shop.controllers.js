import mongoose from "mongoose";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const getAllServiceableCities = async (req, res) => {
  try {
    const cities = await Shop.distinct("city");
    return res.status(200).json(cities);
  } catch (error) {
    return res.status(500).json({ message: `get cities error: ${error.message}` });
  }
};

export const createEditShop = async (req, res) => {
  try {
    const { name, state, city, address } = req.body;
    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const ownerId = new mongoose.Types.ObjectId(req.userId);

    let shop = await Shop.findOne({ owner: ownerId });

    if (!shop) {
      // create shop
      shop = await Shop.create({
        name,
        state,
        city,
        address,
        image,
        owner: ownerId,
      });
    } else {
      // prepare update data
      const updateData = {
        name,
        state,
        city,
        address,
      };
      if (image) updateData.image = image; // 👈 only update if new image provided

      shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true });
    }

    await shop.populate("owner items");
    // notify clients in this city that shops list changed
    const io = req.app.get("io");
    if (io && shop?.city) {
      io.emit("shopsUpdated", { city: shop.city });
    }
    return res.status(201).json(shop);
  } catch (error) {
    // console.error("createEditShop error:", error);
    return res.status(500).json({ message: `create shop error: ${error.message}` });
  }
};


// export const getMyShop = async (req, res) => {
//   try {
//     console.log("getMyShop hit, req.userId =", req.userId);

//     let shop = await Shop.findOne({ owner: req.userId }).populate("owner");

//     if (!shop) {
//       console.log("No shop found for userId:", req.userId);
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     await shop.populate({
//       path: "items",
//       options: { sort: { updatedAt: -1 } },
//     });

//     return res.status(200).json(shop);
//   } catch (error) {
//     console.error("getMyShop error:", error);
//     return res
//       .status(500)
//       .json({ message: `get my shop error: ${error.message}` });
//   }
// };

export const getMyShop = async (req, res) => {
  try {
    // console.log("getMyShop hit, req.userId =", req.userId);

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: userId missing" });
    }

    let shop = await Shop.findOne({ owner: req.userId }).populate("owner");

    if (!shop) {
      // console.log("No shop found for userId:", req.userId);
      return res.status(404).json({ message: "Shop not found" });
    }

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    // console.log("Shop with items:", shop);

    return res.status(200).json(shop);
  } catch (error) {
    // console.error("getMyShop error:", error.stack);
    return res
      .status(500)
      .json({ message: `get my shop error: ${error.message}` });
  }
};



export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (shops.length === 0) {
      return res.status(404).json({ message: "shops not found" });
    }
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `get shop By city error ${error}` });
  }
};

// shop close toggle

export const toggleShopStatus = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    
    shop.isOpen = !shop.isOpen;
    await shop.save();

    // Notify clients (Users) via Socket.IO
    const io = req.app.get("io");
    if (io) {
      // Emit event to all connected clients or specific city room
      // Since shop update affects city listing and shop page, broadcast to all for simplicity
      // In production, optimize with rooms: io.to(shop.city)
      io.emit("shopStatusUpdate", {
        shopId: shop._id,
        isOpen: shop.isOpen,
        city: shop.city
      });
    }

    return res.status(200).json({ message: "Status updated", isOpen: shop.isOpen });
  } catch (error) {
    return res.status(500).json({ message: `toggle status error: ${error.message}` });
  }
};
