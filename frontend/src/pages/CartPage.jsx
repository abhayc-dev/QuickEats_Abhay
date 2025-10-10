//! Code of a Cart Page

import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import CardItemsCard from "../../components/CardItemsCard";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.user);
  const { totalAmount } = useSelector((state) => state.user);

  // console.log("cartItems", cartItems);

  return (
    <div className="min-h-screen flex justify-center p-6 bg-[#FAF9F6]">
      <div className="w-full max-w-[800px] ">
        <div className="flex items-center gap-[20px] mb-6">
          <div
            onClick={() => {
              navigate("/");
            }}
          >
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold ">Your Cart's Items</h1>
        </div>

        {cartItems?.length == 0 ? (
          <p className="text-gray-400 text-large text-center">
            Your Cart is Empty
          </p>
        ) : (<>
          <div className="space-y-4">
             {cartItems.map((items, index) => (
                <CardItemsCard data={items} key={index}/>
             ))}
          </div>
          <div className="mt-6 bg-gray-100 p-2 rounded-xl flex justify-between items-center border shadow border-amber-600">
            <h1 className="text-lg font-semibold ">Total Amount </h1>
            <span className="text-xl font-bold text-">₹{totalAmount}</span> 
          </div>

          <div className="mt-4 flex justify-end">
              <button className="bg-[#ff4d2d] text-gray-100 px-6 py-3 rounded-lg font-medium hover:bg-[#e64526] transition cursor-pointer"
              onClick={() => navigate("/checkOut")}
              >
                Proceed to CheckOut</button>
          </div>
          </>
        )}
      </div>
        
    </div>
  );
};

export default CartPage;
