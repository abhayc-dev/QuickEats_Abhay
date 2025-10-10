//! User Order Card Page

import axios from "axios";
import React, { useState } from "react";
import { BsShopWindow } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../src/config";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();

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
  try {
    const result = await axios.post(
      `${serverUrl}/api/item/rating`,
      { itemId, rating },
      { withCredentials: true }
    );

    setSelectedRating((prev) => ({
      ...prev,
      [itemId]: rating,
    }));

    console.log("Rating submitted:", result.data);
  } catch (error) {
    console.error("Error submitting rating:", error);
  }
};

  return (

<div className="bg-white rounded-xl shadow-lg p-5 space-y-5 border border-gray-200">

  {/* //! Header */}
  <div className="flex justify-between items-start border-b pb-3 border-gray-200">
    <div>
      <p className="font-semibold text-lg">Order #{data._id.slice(-6)}</p>
      <p className="text-sm text-gray-500">
        📅 {formatDate(data?.createdAt)}
      </p>
    </div>
    <div className="text-right space-y-1">
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
        {data?.shopOrders?.[0]?.status || "processing"}
      </span>
      <p className="text-sm text-gray-500">
        {data.paymentMethod?.toUpperCase()}
      </p>
    </div>
  </div>

  {/* //! Shops & Items */}
  {data?.shopOrders?.map((shopOrder, index) => (
    <div
      className="rounded-lg p-4 bg-gray-50 border border-gray-200 space-y-3"
      key={index}
    >
      {/* //! Shop Name */}
      <p className="flex gap-2 items-center font-medium text-gray-700">
        <BsShopWindow className="text-[#ff4d2d]" /> {shopOrder?.shop?.name || "Shop"}
      </p>

      {/* //! Items */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {(shopOrder?.shopOrderItems || []).map((item, idx) => {
          const itemDoc = item?.item && typeof item.item === 'object' ? item.item : null;
          const itemId = itemDoc?._id || item?.item || item?.id || idx;
          const imageUrl = itemDoc?.image || item?.image || "";
          const displayName = item?.name || itemDoc?.name || "Item";
          return (
          <div
            key={itemId}
            className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white shadow-sm hover:shadow-md transition"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                className="w-full h-24 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                No image
              </div>
            )}
            <p className="text-sm font-semibold mt-2 truncate">{displayName}</p>
            <p className="text-xs text-gray-500">
              Qty: {item.quantity} × ₹{item.price}
            </p>

            {/* //! Rating (if delivered) */}
            {shopOrder.status === "delivered" && (
              <div className="flex space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`text-lg cursor-pointer transition ${
                      (selectedRating[itemId] || 0) >= star
                        ? "text-yellow-400 scale-110"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                    onClick={() => handleRating(itemId, star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}
          </div>
        )})}
      </div>

      {/* //! Subtotal */}
      <div className="flex justify-between items-center border-t pt-2 border-gray-200">
        <p className="font-semibold text-gray-700">
          Subtotal: ₹{shopOrder.subtotal}
        </p>
        <span className="text-sm font-medium text-blue-600 capitalize">
          {shopOrder.status}
        </span>
      </div>
    </div>
  ))}

  {/* //! Footer */}
  <div className="flex justify-between items-center border-t pt-3 border-gray-200">
    <p className="font-bold text-lg text-gray-800">
      Total: ₹{data.totalAmount}
    </p>
    <button
      className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md active:scale-95 transition-all"
      onClick={() => navigate(`/track-order/${data._id}`)}
    >
      🚚 Track Order
    </button>
  </div>
</div>

  );
};

export default UserOrderCard;
