//! Owner Order Card
import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Truck, ChevronDown, Utensils, User, CheckCircle } from 'lucide-react';
import axios from "axios";
import { serverUrl } from "../src/config";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../src/redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  const [availableBoys, setAvailableBoys] = useState(data?.shopOrders?.assignment?.broadcastedTo || []);
  const dispatch = useDispatch();

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result?.data?.availableBoys);
    } catch (error) {
      console.log(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'out of delivery': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">

      {/* Header */}
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-4">
          {/* Order ID & Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-500 shadow-sm border border-gray-100">
              <Utensils size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
              <p className="font-mono font-bold text-gray-800 text-sm">#{data._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Placed On</p>
              <p className="font-bold text-gray-800 text-sm">
                {new Date(data.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, {new Date(data.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${getStatusColor(data?.shopOrders?.status)}`}>
          {data?.shopOrders?.status}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Customer & Location Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="mt-1 w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm flex-shrink-0">
              <User size={18} />
            </div>
            <div className="space-y-1 overflow-hidden">
              <h3 className="font-bold text-gray-900">{data?.user?.fullName}</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={12} /> <span className="truncate">{data?.user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={12} /> <span>+91 {data?.user?.mobile}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="mt-1 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-sm flex-shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Delivery Address</h3>
              <p className="text-sm text-gray-600 leading-snug line-clamp-2">{data?.deliveryAddress?.text}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">Order Items ({data.shopOrders.shopOrderItems.length})</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
            {data.shopOrders.shopOrderItems.map((item, index) => (
              <div key={index} className="flex-shrink-0 w-44 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full h-28 bg-gray-100 rounded-xl mb-3 overflow-hidden relative">
                  <img src={item?.item?.image} alt={item?.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-lg">x{item.quantity}</span>
                </div>
                <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions & Delivery Assignment */}
        <div className="space-y-4 pt-4 border-t border-gray-100">

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-auto relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <select
                className="w-full sm:w-48 appearance-none bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm rounded-xl py-3 pl-4 pr-10 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer hover:bg-white"
                value={data?.shopOrders?.status}
                onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="out of delivery">Out Of Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-right">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Bill</span>
              <span className="text-2xl font-black text-gray-900">₹{data?.shopOrders?.subtotal}</span>
            </div>
          </div>

          {/* Delivery Boy Status */}
          {data.shopOrders.status === "out of delivery" && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              {data.shopOrders.assignedDeliveryBoy ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-bold uppercase mb-0.5">Assigned Partner</p>
                      <p className="font-bold text-gray-900 text-sm">{data?.shopOrders?.assignedDeliveryBoy?.fullName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <a href={`tel:${data?.shopOrders?.assignedDeliveryBoy?.mobile}`} className="text-xs font-bold bg-white text-green-600 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                      Call Partner
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                      Broadcasting to {availableBoys.length} nearby partners...
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableBoys.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-orange-100 shadow-sm text-xs font-medium text-gray-600 opacity-75">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        {b?.fullName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerOrderCard;
