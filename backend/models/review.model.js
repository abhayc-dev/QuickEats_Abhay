import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    items : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    }],
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        trim: true
    },
    photos: [{
        type: String // URL of the photo
    }],
    reviewType: {
        type: String, // 'shop' or 'delivery' or 'both' - actually, keeping it simple: This model represents a review for the Shop. Delivery rating can be separate or part of it.
        // Let's stick to Shop Review for now to meet the "photos of food" requirement.
        default: 'shop'
    }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
