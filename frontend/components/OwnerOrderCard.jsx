//! Owner Order Card

import React, { useState } from "react";
import { IoMailUnreadOutline } from "react-icons/io5";
import { FcIphone } from "react-icons/fc";
import { IoLocationOutline } from "react-icons/io5";
import axios from "axios";
import { serverUrl } from "../src/config";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../src/redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  //! state for availableBoys
  const [availableBoys, setAvailableBoys] = useState([]);

  const dispatch = useDispatch();
  //! fetch api for update the status
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result?.data?.availableBoys);
      console.log(result.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6 hover:shadow-md transition-shadow duration-300">

      {/* User & Location Info Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            {data?.user?.fullName}
            <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">Customer</span>
          </h2>
          <div className="space-y-2">
            <p className="flex items-center gap-3 text-sm text-gray-600">
              <span className="p-1.5 bg-white rounded-full text-orange-500 shadow-sm"><IoMailUnreadOutline /></span>
              {data?.user?.email}
            </p>
            <p className="flex items-center gap-3 text-sm text-gray-600">
              <span className="p-1.5 bg-white rounded-full text-blue-500 shadow-sm"><FcIphone /></span>
              +91 {data?.user?.mobile}
            </p>
            <p className="flex items-center gap-3 text-sm text-gray-600">
              <span className="p-1.5 bg-white rounded-full text-green-500 shadow-sm">
                {data?.paymentMethod === "online" ? <span className="font-bold">₹</span> : <span className="font-bold">💵</span>}
              </span>
              <span className="capitalize">{data?.paymentMethod} Payment {data?.paymentMethod === "online" && (data?.payment ? "(Paid)" : "(Pending)")}</span>
            </p>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col justify-center">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-50 text-red-500 rounded-xl mt-1">
              <IoLocationOutline size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 leading-relaxed mb-1">
                {data?.deliveryAddress?.text}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {data?.deliveryAddress?.latitude?.toFixed(4)}, {data?.deliveryAddress?.longitude?.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Scroll */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Order Items</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {data.shopOrders.shopOrderItems.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-40 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm"
            >
              <div className="relative mb-2">
                <img
                  src={item?.item?.image || ""}
                  alt={item?.name}
                  className="w-full h-24 object-cover rounded-xl bg-gray-100"
                />
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                  x{item?.quantity}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800 truncate">{item?.name}</p>
              <p className="text-xs text-gray-500 font-medium">₹{item?.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Status & Assignment */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Current Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${data?.shopOrders?.status === 'delivered' ? 'bg-green-100 text-green-700' :
              data?.shopOrders?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
              {data?.shopOrders?.status}
            </span>
          </div>

          <select
            className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-2.5 shadow-sm"
            onChange={(e) =>
              handleUpdateStatus(
                data._id,
                data.shopOrders.shop._id,
                e.target.value
              )
            }
          >
            <option value="">Update Status...</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out of delivery">Out Of Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Delivery Boy Assignment Section */}
        {data.shopOrders.status === "out of delivery" && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/50">
            <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-2">
              🚚 Delivery Assignnment
            </h4>
            {data.shopOrders.assignedDeliveryBoy ? (
              <div className="flex items-center justify-between text-sm text-amber-900 bg-white/50 p-2 rounded-lg">
                <span className="font-semibold">{data?.shopOrders?.assignedDeliveryBoy?.fullName}</span>
                <span className="font-mono">{data?.shopOrders?.assignedDeliveryBoy?.mobile}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-amber-700 mb-2">Available Delivery Partners:</p>
                {availableBoys?.length > 0 ? (
                  availableBoys.map((b, index) => (
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm text-sm" key={index}>
                      <span className="text-gray-900 font-medium">{b?.fullName}</span>
                      <span className="text-gray-500">{b?.mobile}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-amber-600 italic flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Waiting for acceptance...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Total */}
      <div className="flex justify-end items-center pt-2">
        <p className="text-gray-600 font-medium text-sm">Total Order Value</p>
        <p className="text-2xl font-black text-gray-900 ml-3">₹{data?.shopOrders?.subtotal}</p>
      </div>
    </div>
  );
};

export default OwnerOrderCard;
