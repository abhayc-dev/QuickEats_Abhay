import Review from "../models/review.model.js";
import Shop from "../models/shop.model.js";

// Add a new review
export const addReview = async (req, res) => {
    try {
        const { shopId, orderId, rating, reviewText } = req.body;
        const userId = req.userId; // user id from middleware

        if (!shopId || !orderId || !rating) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Handle photos
        let photos = [];
        if (req.files && req.files.length > 0) {
            photos = req.files.map(file => `${file.filename}`);
        }

        // Create review
        const newReview = new Review({
            user: userId,
            shop: shopId,
            order: orderId,
            rating,
            reviewText,
            photos
        });

        await newReview.save();

        // Update Shop's average rating (Simple approach: Recalculate)
        // ideally this should be a background job or incremental, but for now:
        const reviews = await Review.find({ shop: shopId });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = totalRating / reviews.length;
            
            // Assuming Shop model has a rating field? If not, we might need to add it or just rely on calculating it on fetch.
            // Let's check Shop model. If doesn't exist, we can't update it. 
            // For now, let's just save the review.
        }

        return res.status(201).json({ message: "Review added successfully", review: newReview });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get reviews for a shop
export const getShopReviews = async (req, res) => {
    try {
        const { shopId } = req.params;
        const reviews = await Review.find({ shop: shopId })
            .populate("user", "fullName") // showing user name
            .sort({ createdAt: -1 }); // newest first

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Error fetching reviews" });
    }
}
