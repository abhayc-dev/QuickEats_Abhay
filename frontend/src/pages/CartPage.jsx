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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <IoIosArrowRoundBack size={28} className="text-gray-600 group-hover:text-orange-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {cartItems?.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-orange-200 transition-all duration-300"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart Items List */}
            <div className="flex-1 w-full space-y-4">
              {cartItems.map((items, index) => (
                <CardItemsCard data={items} key={index} />
              ))}
            </div>

            {/* Summary Card */}
            <div className="w-full lg:w-[380px] bg-white rounded-3xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Taxes (5%)</span>
                  <span className="font-medium text-gray-900">₹{(totalAmount * 0.05).toFixed(0)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 my-4 pt-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-gray-900 font-bold text-lg">Total</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">₹{Math.floor(totalAmount * 1.05)}</span>
                </div>
                <p className="text-xs text-gray-400 text-right">Including all taxes</p>
              </div>

              <button
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => navigate("/checkOut")}
              >
                Proceed to Checkout
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
