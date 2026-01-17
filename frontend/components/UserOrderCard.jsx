//! User Order Card Page

import axios from "axios";
import React, { useState } from "react";
import { BsShopWindow } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../src/config";

import ReviewModal from "./ReviewModal";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewData, setSelectedReviewData] = useState({ shopId: null, orderId: null, shopName: "" });

  const [selectedRating, setSelectedRating] = useState({}); //itemId:rating
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  //! fetch the api for rating
  const handleRating = async (itemId, rating) => {
    if (!itemId) {
      console.error("Invalid Item ID");
      return;
    }

    // Optimistic update
    setSelectedRating((prev) => {
      const newState = { ...prev, [itemId]: rating };
      localStorage.setItem("my_ratings", JSON.stringify(newState)); // Local Persistence
      return newState;
    });

    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true }
      );
      console.log("Rating submitted:", result.data);
    } catch (error) {
      console.error("Error submitting rating:", error);
      // Revert if needed, but for now we keep the optimistic update 
      // as the user's intent is more important for UI feedback
    }
  };

  // Load persisted ratings on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("my_ratings");
    if (saved) {
      try {
        setSelectedRating(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse ratings", e);
      }
    }
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6 sm:p-8 relative overflow-hidden group">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-lg text-gray-900">Order #{data._id.slice(-6)}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${data?.shopOrders?.[0]?.status === 'delivered'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-50 text-blue-600'
              }`}>
              {data?.shopOrders?.[0]?.status || "processing"}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
            <span>📅 {formatDate(data?.createdAt)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{data.paymentMethod?.toUpperCase()}</span>
          </p>
        </div>

        {/* Total Amount & Track Button (Desktop) */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-right mr-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Amount</p>
            <p className="text-xl font-black text-gray-900">₹{data.totalAmount}</p>
          </div>
          <button
            className="bg-gray-900 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:shadow-orange-200 active:scale-95 transition-all duration-300 flex items-center gap-2"
            onClick={() => navigate(`/track-order/${data._id}`)}
          >
            <span>Track Order</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Shops & Items */}
      <div className="space-y-6">
        {data?.shopOrders?.map((shopOrder, index) => (
          <div key={index} className="space-y-4">
            {/* Shop Name */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <BsShopWindow size={18} />
              </div>
              <p className="font-bold text-gray-800 text-base">
                {shopOrder?.shop?.name || "Shop"}
              </p>
            </div>

            {/* Items Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {(shopOrder?.shopOrderItems || []).map((item, idx) => {
                const itemDoc = item?.item && typeof item.item === 'object' ? item.item : null;
                const itemId = itemDoc?._id || item?.item || item?.id; // Removing 'idx' fallback to avoid invalid IDs
                const imageUrl = itemDoc?.image || item?.image || "";
                const displayName = item?.name || itemDoc?.name || "Item";

                return (
                  <div
                    key={itemId || idx}
                    className="flex-shrink-0 w-48 bg-gray-50/50 rounded-2xl p-3 border border-gray-100 hover:border-orange-100 transition-colors"
                  >
                    <div className="relative mb-3 group/image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={displayName}
                          className="w-full h-32 object-cover rounded-xl shadow-sm group-hover/image:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">
                          No image
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        x{item.quantity}
                      </div>
                    </div>

                    <p className="text-sm font-bold text-gray-900 truncate mb-1" title={displayName}>{displayName}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      ₹{item.price} / item
                    </p>

                    {/* Rating (if delivered) */}
                    {shopOrder.status === "delivered" && (
                      <div className="flex gap-1 mt-3 justify-center bg-white rounded-lg py-1 border border-gray-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className={`text-lg transition-transform hover:scale-110 focus:outline-none cursor-pointer p-0.5 ${(selectedRating[itemId] || 0) >= star
                                ? "text-yellow-400"
                                : "text-gray-200 hover:text-yellow-300"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card clicks if any
                              handleRating(itemId, star);
                            }}
                            title={`Rate ${star} stars`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Subtotal & Rate Shop Action */}
            <div className="flex flex-wrap justify-between items-center pt-3 border-t border-dashed border-gray-200 gap-4">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize border ${shopOrder.status === 'delivered'
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                  {shopOrder.status}
                </span>
                {shopOrder.status === "delivered" && (
                  <button
                    className="text-xs px-4 py-2 bg-amber-100 text-amber-800 font-bold rounded-xl hover:bg-amber-200 transition-colors flex items-center gap-1"
                    onClick={() => {
                      setSelectedReviewData({
                        shopId: shopOrder.shop._id || shopOrder.shop,
                        orderId: data._id,
                        shopName: shopOrder.shop.name || "Shop"
                      });
                      setReviewModalOpen(true);
                    }}
                  >
                    <span>★ Rate Shop</span>
                  </button>
                )}
              </div>
              <p className="font-bold text-gray-700 text-sm">
                Subtotal: <span className="text-gray-900">₹{shopOrder.subtotal}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Footer for Total & Track */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex sm:hidden flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 font-medium">Total Amount</span>
          <span className="text-2xl font-black text-gray-900">₹{data.totalAmount}</span>
        </div>
        <button
          className="w-full bg-gray-900 hover:bg-orange-600 text-white py-4 rounded-xl text-sm font-bold shadow-lg transition-colors flex justify-center items-center gap-2"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          <span>Track Order</span>
          <span>→</span>
        </button>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        shopId={selectedReviewData.shopId}
        orderId={selectedReviewData.orderId}
        shopName={selectedReviewData.shopName}
      />
    </div>
  );
};

export default UserOrderCard;
