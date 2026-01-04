
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';
import { serverUrl } from '../src/config';

const ReviewModal = ({ isOpen, onClose, shopId, orderId, shopName }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [photos, setPhotos] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 5) {
            alert("You can only upload up to 5 photos");
            return;
        }
        setPhotos([...photos, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('shopId', shopId);
            formData.append('orderId', orderId);
            formData.append('rating', rating);
            formData.append('reviewText', reviewText);

            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            await axios.post(`${serverUrl}/api/review/add-review`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            alert("Review submitted successfully!");
            onClose();
            // Reset form
            setRating(0);
            setReviewText("");
            setPhotos([]);
            setPreviewUrls([]);

        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-[#ff4d2d] p-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold">Rate {shopName || "Order"}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                        <IoMdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Star Rating */}
                    <div className="flex justify-center mb-6">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <label key={index}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="rating"
                                        value={ratingValue}
                                        onClick={() => setRating(ratingValue)}
                                    />
                                    <FaStar
                                        className="cursor-pointer transition-colors duration-200"
                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        size={40}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(rating)} // Reset hover to current rating
                                    />
                                </label>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Review Text */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Write a Review</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] resize-none"
                                rows="4"
                                placeholder="How was the food? Tell us about it..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Photo Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Add Photos</label>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {/* Preview Images */}
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border">
                                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                ))}

                                {/* Upload Button */}
                                {photos.length < 5 && (
                                    <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#ff4d2d] text-gray-400 hover:text-[#ff4d2d] transition">
                                        <span className="text-2xl">+</span>
                                        <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-xl font-bold text-white transition ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff4d2d] hover:bg-[#e64526]'}`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
