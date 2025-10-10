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

const FoodCard = ({ data }) => {
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
    dispatch(
      addToCart({
        id: data._id,
        name: data.name,
        price: data.price,
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

  

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md group hover:scale-[1.03] transition-transform duration-200 ease-in-out">

      {/* //! IMAGE + OVERLAYS */}
      <div className="relative ">
        <img
          src={data?.image}
          alt={data?.name}
          className="w-full h-56 object-cover"
        />

        {/* //! small veg/fish icon top-left */}
        <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-full p-1 shadow-sm">
          {data.foodType === "veg" ? (
            <FaLeaf className="text-green-600" />
          ) : (
            <PiFishFill className="text-red-500" />
          )}
        </div>

        {/* <button
          className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-md opacity-95"
          // wire this to your customise modal if you have one
          onClick={() => {
            
          }}
        >
          Customise →
        </button> */}

        {/* //! Gradient overlay with name + short desc */}
        <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-lg font-semibold truncate">
              {data.name}
            </h3>
          </div>
          <p className="text-white/80 text-sm mt-1 truncate">
            {data.category || data.description || "Delicious food item"}
          </p>

          {/* //! optional rating inside gradient (small) */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {renderStars(data.rating?.average || 0)}
            </div>
            <span className="text-xs text-white/70">
              ({data.rating?.count || 0})
            </span>
          </div>
        </div>
      </div>

      {/* //! BOTTOM DARK BAND: price on left, add/qty area on right */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b  from-black/30">
        <div>
          <div className="text-gray-600 font-bold text-lg">₹{data.price}</div>
          <div className="text-xs text-gray/60 mt-1">
            Regular | Best Served 
          </div>
        </div>

        {/* //! Add button OR quantity controls (replace in-place when item in cart) */}
        <div>
          {quantity > 0 ? (
            <div className="flex items-center border rounded-full overflow-hidden shadow-sm bg-red-50 border-none">
              <button
                className="px-3 py-3 hover:bg-red-100 transition cursor-pointer"
                onClick={handleDecrease}
              >
                <FaMinus size={12} />
              </button>
              <span className="px-3">{quantity}</span>
              <button
                className="px-3 py-3 hover:bg-red-100 transition cursor-pointer"
                onClick={handleIncrease}
              >
                <FaPlus size={12} />
              </button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 bg-[#ff4d2d] text-white px-3 py-2 rounded-lg hover:bg-[#e63e20] transition-colors cursor-pointer"
              onClick={handleAdd}
            >
              <FaCartPlus /> Add +
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
