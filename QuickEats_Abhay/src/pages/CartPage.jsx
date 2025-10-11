//! Code of a Cart Page

import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import CardItemsCard from "../../components/CardItemsCard";
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button";

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
        
          <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-8">
                  Start shopping to add items to your cart
                </p>
                  <Button size="lg" className="bg-[#ff532df0] hover:bg-[#ff4d2d]" onClick={() => {navigate("/")}}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((items, index) => (
                <CardItemsCard data={items} key={index} />
              ))}
            </div>
            <div className="mt-6 bg-gray-100 p-2 rounded-xl flex justify-between items-center border shadow border-amber-600">
              <h1 className="text-lg font-semibold ">Total Amount </h1>
              <span className="text-xl font-bold text-">₹{totalAmount}</span>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-[#ff4d2d] text-gray-100 px-6 py-3 rounded-lg font-medium hover:bg-[#e64526] transition cursor-pointer"
                onClick={() => navigate("/checkOut")}
              >
                Proceed to CheckOut
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
