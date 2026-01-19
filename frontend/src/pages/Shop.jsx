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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100">
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

      <div className="min-h-screen bg-[#FAF9F6] pb-18">
        {/* //! Back Button */}
        <div className="absolute z-50 top-4 left-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full font-semibold hover:bg-white/30 hover:scale-105 transition-all shadow-lg"
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
            className={`w-full h-full object-cover ${!shopDetails.isOpen ? 'grayscale' : ''}`}
          />
          {/* Closed Overlay */}
          {!shopDetails.isOpen && (
            <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-blur-[2px]">
              <div className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-3xl border-4 border-white transform -rotate-12 shadow-2xl tracking-widest uppercase">
                Currently Closed
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pb-10 items-center text-white text-center z-20">
            <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg tracking-tight">{shopDetails.name}</h1>
            <p className="flex items-center gap-2 mt-3 text-lg md:text-xl font-medium opacity-90 bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm">
              <MapPin size={18} className="text-yellow-400" /> {shopDetails.address}, {shopDetails.city}, {shopDetails.state}
            </p>
          </div>
        </div>

        {/* //! Menu Section */}
        <div className="max-w-7xl mx-auto px-4 py-10 flex justify-center flex-col items-center">
          <h1 className="text-4xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-600 drop-shadow-sm text-center">
            🍴 Inspiration for Your First Order
          </h1>

          {shopItems?.length > 0 ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-5">
              {shopItems.map((item) => (
                <FoodCard
                  key={item._id}
                  data={{ ...item, shop: shopDetails }}
                  shopOpen={shopDetails.isOpen} // Pass open status
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">
              No items Available{" "}
            </p>
          )}
        </div>

        {/* //! Customer Reviews Section */}
        <div className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <span className="text-yellow-500">⭐</span> Customer Reviews <span className="text-gray-400 text-xl font-normal">({reviews.length})</span>
          </h2>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-50 hover:shadow-md hover:border-orange-100 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center font-bold text-orange-600 text-lg shadow-inner">
                        {review.user?.fullName?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">{review.user?.fullName || "Anonymous"}</p>
                        <p className="text-xs text-gray-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4 italic">"{review.reviewText}"</p>

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
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-600 to-yellow-500 text-white shadow-[0_-5px_20px_rgba(249,115,22,0.3)] border-t border-orange-400/50 p-4 flex justify-between items-center rounded-t-3xl z-50 backdrop-blur-lg">
            <div className="flex justify-center items-center gap-1">
              <p className="font-semibold">
                🛒 {getTotalItems()} item{getTotalItems() > 1 ? "s" : ""} in
                cart |
              </p>
              <p className="text-sm text-white/80">Total: ₹{getTotalPrice()}</p>
            </div>
            <button
              className="bg-white text-orange-600 px-6 py-2.5 rounded-full font-bold hover:bg-orange-50 transition-colors shadow-md active:scale-95"
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
