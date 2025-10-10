import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, deleteItem, editItem, getItemById, getItemsByCity, getItemsByShopId, rating, searchItems } from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";



const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth,upload.single("image"),addItem); // add new item
itemRouter.put("/edit-item/:itemId", isAuth,upload.single("image"),editItem) // edit specific item
// Public read-only endpoints
itemRouter.get("/get-by-id/:itemId", getItemById);  // get-item
itemRouter.get("/get-by-city/:city", getItemsByCity);  //  get items by city id
itemRouter.get("/get-by-shop/:shopId", getItemsByShopId );  // items by shop
itemRouter.get("/search-items", searchItems );  
// Protected destructive actions
itemRouter.get("/delete/:itemId", isAuth, deleteItem);  // delete-item by id
itemRouter.post("/rating", isAuth, rating );  


export default itemRouter;
