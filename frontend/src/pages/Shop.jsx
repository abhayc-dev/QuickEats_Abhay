//! Shop page, It show the specific Shop Items

import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverUrl } from "../config";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import FoodCard from "../../components/FoodCard";
import { useSelector } from "react-redux";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/loading.json";
import Nav from "./Nav";
import { IoMdClose } from "react-icons/io";

const Shop = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shopDetails, setShopDetails] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  //! Get cart items from Redux
  const { cartItems = [] } = useSelector((state) => state.user || {});

  //! Total items and price from Redux
  const getTotalItems = () =>
    cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const getTotalPrice = () =>
    cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0);

  //! Fetch shop details + items
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-shop/${shopId}`,
          {}
        );
        setShopItems(result?.data?.items || []);
        setShopDetails(result?.data?.shop || {});

        const reviewResult = await axios.get(`${serverUrl}/api/review/shop/${shopId}`);
        setReviews(reviewResult.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchShop();
  }, [shopId]);

  if (!shopDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <Lottie
          animationData={loaderAnimation}
          loop={false} // plays only once
          style={{ width: 250, height: 250 }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* <Nav /> */}

      <div className="min-h-screen bg-[#FAF9F6]">
        {/* //! Back Button */}
        <div className="absolute z-20 flex items-center gap-2 bg-gradient-to-b from-black/50 to-black/70 px-2 py-1 m-2 bg-amber-50 rounded-full hover:scale-105 transition-transform ">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-50 font-semibold"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* //! Shop Header */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden shadow-md">
          <img
            src={shopDetails.image}
            alt={shopDetails.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-white text-center">
            <h1 className="text-3xl font-bold">{shopDetails.name}</h1>
            <p className="flex items-center gap-2 mt-2 text-sm sm:text-base">
              <MapPin size={16} /> {shopDetails.address}, {shopDetails.city},{" "}
              {shopDetails.state}
            </p>
          </div>
        </div>

        {/* //! Menu Section */}
        <div className="max-w-6xl mx-auto px-1 py-5 flex justify-center flex-col items-center">
          <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold mb-8">
            🍴 Inspiration for Your First Order
          </h1>

          {shopItems?.length > 0 ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-5">
              {shopItems.map((item) => (
                <FoodCard key={item._id} data={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">
              No items Available{" "}
            </p>
          )}
        </div>

        {/* //! Customer Reviews Section */}
        <div className="max-w-6xl mx-auto px-4 py-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">⭐ Customer Reviews ({reviews.length})</h2>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {review.user?.fullName?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{review.user?.fullName || "Anonymous"}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{review.reviewText}</p>

                  {/* Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {review.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={`${serverUrl}/images/${photo}`}
                          alt="review-pic"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                          onClick={() => setSelectedImage(`${serverUrl}/images/${photo}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No reviews yet. Be the first to order and review!</p>
          )}
        </div>

        {/* //! Cart Bar */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#f65336] text-white shadow-lg border-t p-2 flex justify-between items-center rounded-md m-1">
            <div className="flex justify-center items-center gap-1">
              <p className="font-semibold">
                🛒 {getTotalItems()} item{getTotalItems() > 1 ? "s" : ""} in
                cart |
              </p>
              <p className="text-sm text-white/80">Total: ₹{getTotalPrice()}</p>
            </div>
            <button
              className="bg-white text-[#ff4d2d] px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              onClick={() => navigate("/cart")}
            >
              View Cart
            </button>
          </div>
        )}

        {/* //! Image Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <button
                className="absolute -top-12 right-0 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition backdrop-blur-md mt-10"
                onClick={() => setSelectedImage(null)}
              >
                <IoMdClose size={30} />
              </button>
              <img
                src={selectedImage}
                alt="Full review"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
