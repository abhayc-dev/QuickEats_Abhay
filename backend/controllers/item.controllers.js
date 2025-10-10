import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "shop not found" });
    }
    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });

    //push item data in shop
    shop.items.push(item._id);
    await shop.save();
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    // emit socket event to refresh items for users in same city
    const io = req.app.get("io");
    if (io) {
      io.emit("itemsUpdated", { city: shop.city });
    }

    return res.status(201).json(shop); //item -> shop
  } catch (error) {
    return res.status(500).json({ message: `add item error ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        foodType,
        price,
        image,
      },
      { new: true }
    );
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    //get shop by id
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    // emit socket event to refresh items for users in same city
    const io = req.app.get("io");
    if (io && shop) {
      io.emit("itemsUpdated", { city: shop.city });
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `item edit error ${error}` });
  }
};

//Get item by id
export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

// Delete logic with filter
export const deleteItem = async (req, res) => {
  try {
    const itemId = await req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter((i) => i !== item._id);
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    // emit socket event to refresh items for users in same city
    const io = req.app.get("io");
    if (io && shop) {
      io.emit("itemsUpdated", { city: shop.city });
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete tem error ${error}` });
  }
};

export const getItemsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (!shops) {
      return res.status(400).json({ message: "shops not found" });
    }
    const shopIds = shops.map((shop) => shop._id);

    const items = await Item.find({ shop: { $in: shopIds } });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: `get Item By City error ${error}` });
  }
};

//! get items by shop id
export const getItemsByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) {
      return res.status(400).json({ message: "shop not found" });
    }
    return res.status(200).json({ shop, items: shop.items });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get Item By ShopId error ${error}` });
  }
};

//! search item by search
export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query || !city) {
      return null;
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (shops.length === 0) {
      return res.status(404).json({ message: "shops not found" });
    }
    const shopIds = shops.map(s => s._id)
    const items = await Item.find({
      shop:{$in:shopIds},
      $or:[
        {name:{$regex:query, $options:"i"}},
        {category:{$regex:query, $options:"i"}}
      ]
    }).populate("shop", "name image")

    return res.status(200).json(items)

  } catch (error) {
         return res
      .status(500)
      .json({ message: `search items error ${error}` });
  }
};


//! controller for rating
export const rating = async (req, res) => {
  try {
    let { itemId, rating } = req.body;

    // Ensure rating is a number
    rating = Number(rating);

    if (!itemId || !rating) {
      return res.status(400).json({ message: "ItemId and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 to 5" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Ensure rating object exists
    if (!item.rating) {
      item.rating = { count: 0, average: 0 };
    }

    const newCount = item.rating.count + 1;
    const newAverage =
      (item.rating.average * item.rating.count + rating) / newCount;

    // Update values
    item.rating.count = newCount;
    item.rating.average = Number(newAverage.toFixed(2)); // Round to 2 decimals
    await item.save();

    return res.status(200).json({ rating: item.rating });
  } catch (error) {
    return res.status(500).json({ message: `Rating error: ${error.message}` });
  }
};
