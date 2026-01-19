//! Card for the Items (Food)

import React, { useEffect, useState } from "react";
import { FaLeaf } from "react-icons/fa6";
import { PiFishFill } from "react-icons/pi";
import { FaStar } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaCartPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  deleteQuantity,
  updateQuantity,
} from "../src/redux/userSlice";

const FoodCard = ({ data, shopOpen = true }) => {
  const dispatch = useDispatch();
  const { cartItems = [] } = useSelector((state) => state.user || {});

  //! find the cart item for this product (assumes cart item shape uses id === data._id)
  const cartItem = cartItems.find((i) => i.id === data._id);

  //! local quantity state mirrors the cart item quantity (keeps UX snappy)
  const [quantity, setQuantity] = useState(cartItem?.quantity || 0);

  //! keep local quantity in sync if cart changes elsewhere
  useEffect(() => {
    setQuantity(cartItem?.quantity || 0);
  }, [cartItem?.quantity]);

  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="inline-flex">
          {i <= rating ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-yellow-400" />
          )}
        </span>
      );
    }
    return stars;
  };

  //! helper to dispatch add/update; your reducer should accept quantity and update/remove accordingly
  const updateCart = (newQty) => {
    const discountedPrice = data.discount > 0
      ? Math.round(data.price - (data.price * data.discount / 100))
      : data.price;

    dispatch(
      addToCart({
        id: data._id,
        name: data.name,
        price: discountedPrice,
        originalPrice: data.price,
        discount: data.discount,
        image: data.image,
        shop: data.shop,
        quantity: newQty,
        foodType: data.foodType,
      })
    );
  };

  const handleAdd = () => {
    // add first item (qty = 1)
    const newQty = 1;
    setQuantity(newQty); // optimistic UI
    updateCart(newQty);
  };

  const handleIncrease = () => {
    dispatch(updateQuantity({ id: data._id, quantity: quantity + 1 }));
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      dispatch(updateQuantity({ id: data._id, quantity: quantity - 1 }));
    } else {
      dispatch(deleteQuantity({ id: data._id }));
    }
  };

  const discountedPrice = data.discount > 0
    ? Math.round(data.price - (data.price * data.discount / 100))
    : data.price;

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out border border-gray-100 ${!shopOpen ? 'opacity-70 pointer-events-none' : ''}`}>

      {/* //! IMAGE + OVERLAYS */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={data?.image}
          alt={data?.name}
          className={`w-full h-full object-cover transform transition-transform duration-700 ${shopOpen ? 'group-hover:scale-110' : 'grayscale'}`}
        />

        {/* //! small veg/fish icon top-left */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
          {data.foodType === "veg" ? (
            <FaLeaf className="text-green-600" size={14} />
          ) : (
            <PiFishFill className="text-red-500" size={14} />
          )}
        </div>

        {/* //! Discount Badge */}
        {data.discount > 0 && shopOpen && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm animate-pulse">
            {data.discount}% OFF
          </div>
        )}

        {/* //! Gradient overlay with name + short desc */}
        <div className="absolute inset-x-0 bottom-0 pt-10 pb-4 px-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xl font-bold truncate tracking-wide">
              {data.name}
            </h3>
            {data.rating?.average > 0 && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                <FaStar className="text-yellow-400 text-xs" />
                <span className="text-white text-xs font-bold">{Number(data.rating.average).toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-gray-200 text-sm mt-1 truncate font-medium">
            {data.description || "Fresh & Delicious"}
          </p>
        </div>
      </div>

      {/* //! BOTTOM DETAILS SECTION */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-orange-600 font-bold text-xl">₹{discountedPrice}</span>
              {data.discount > 0 && (
                <span className="text-gray-400 font-medium text-xs line-through">₹{data.price}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">
              {data.discount > 0 ? <span className="text-green-600 font-bold">You Save ₹{data.price - discountedPrice}</span> : data.category}
            </div>
          </div>

          {/* //! Add button OR quantity controls */}
          <div>
            {!shopOpen ? (
              // Closed State Button
              <button disabled className="bg-gray-200 text-gray-500 px-4 py-2 rounded-full text-xs font-bold cursor-not-allowed">
                Closed
              </button>
            ) : quantity > 0 ? (
              <div className="flex items-center bg-orange-50 rounded-full border border-orange-100 shadow-inner">
                <button
                  className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-200 rounded-full transition"
                  onClick={handleDecrease}
                >
                  <FaMinus size={10} />
                </button>
                <span className="w-6 text-center text-orange-700 font-bold text-sm">{quantity}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-200 rounded-full transition"
                  onClick={handleIncrease}
                >
                  <FaPlus size={10} />
                </button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-yellow-600 transition-all active:scale-95"
                onClick={handleAdd}
              >
                Add <FaCartPlus size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
