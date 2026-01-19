//! Owner DashBoard Page


import React, { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import Nav from "../src/pages/Nav";
import { useSelector, useDispatch } from "react-redux";
import {
  Store, MapPin, Edit3, Plus, Utensils, TrendingUp,
  ShoppingBag, Star, DollarSign, Clock, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../src/config";
import { setMyShopData } from "../src/redux/ownerSlice";
import OwnerItemCard from "./OwnerItemCard";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const { myOrders } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for calculation
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    rating: 0
  });

  useEffect(() => {
    //! Fetch shop from backend only if we don't have it in Redux
    const fetchShop = async () => {
      if (!myShopData) {
        try {
          const res = await axios.get(`${serverUrl}/api/shop/get-my`, {
            withCredentials: true,
          });
          dispatch(setMyShopData(res.data)); // store in Redux
        } catch (err) {
          console.error(
            "Error fetching shop:",
            err.response?.data || err.message
          );
        }
      }
    };
    fetchShop();
  }, [myShopData, dispatch]);

  // Calculate Stats
  useEffect(() => {
    if (myOrders && myOrders.length > 0) {
      const rev = myOrders.reduce((acc, order) => {
        // Only count delivered/paid orders for revenue usually, 
        // but for now we sum all valid orders
        if (order.payment === true || order.status === 'delivered') {
          return acc + (order.shopOrders?.subtotal || 0);
        }
        return acc;
      }, 0);

      const codRev = myOrders.reduce((acc, order) => {
        // Check for COD payment method (case insensitive)
        const isCOD = order.paymentMethod?.toLowerCase() === 'cod';
        const status = order.shopOrders?.status; // Check Shop-Specific Status

        // Include "out of delivery" which is the backend enum value
        if (isCOD && (status === 'delivered' || status === 'placed' || status === 'preparing' || status === 'out of delivery' || status === 'out for delivery')) {
          return acc + (order.shopOrders?.subtotal || 0);
        }
        return acc;
      }, 0);

      const pending = myOrders.filter(o => ['placed', 'preparing', 'out for delivery'].includes(o.status)).length;

      setStats({
        revenue: rev,
        codRevenue: codRev,
        totalOrders: myOrders.length,
        pendingOrders: pending,
        rating: myShopData?.rating?.average || 4.5 // detailed rating logic usually in backend
      });
    }
  }, [myOrders, myShopData]);

  const StatCard = ({ icon: Icon, label, value, color, subText }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between group">
      <div>
        <p className="text-gray-500 font-medium text-sm mb-1">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
        {subText && <p className={`text-xs font-bold mt-2 ${color}`}>{subText}</p>}
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] pb-20 mt-20">
      <Nav />

      {!myShopData ? (
        // ! Display when not any Shop Data
        <div className="flex flex-col justify-center items-center min-h-[80vh] px-4">
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-[2rem] p-10 border border-gray-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-6 shadow-inner">
                <Store size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                Launch Your Restaurant
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm leading-relaxed text-lg">
                Join our premium food delivery network. Reach thousands of local foodies today.
              </p>
              <button
                className="
                  px-8 py-4 w-full
                  font-bold text-lg text-white bg-[#111] rounded-2xl shadow-xl 
                  hover:bg-orange-600 hover:shadow-orange-200
                  transform transition-all duration-300 ease-out 
                  active:scale-95 flex items-center justify-center gap-2"
                onClick={() => navigate("/partner/create-edit-shop")}
              >
                Get Started <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        //! Display, When have a Shop Data
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-20">

          {/* 1. Header & ID Card Style */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
              <img
                src={myShopData.image}
                alt="Shop"
                className="w-full h-full object-cover rounded-2xl shadow-lg border-4 border-white"
              />
              <button
                onClick={() => navigate("/partner/create-edit-shop")}
                className="absolute -bottom-3 -right-3 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{myShopData.name}</h1>
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await axios.patch(`${serverUrl}/api/shop/toggle-status`, {}, { withCredentials: true });
                        dispatch(setMyShopData({ ...myShopData, isOpen: res.data.isOpen }));
                      } catch (error) {
                        console.error("Toggle status error:", error);
                        alert("Failed to update status");
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer transition-all border flex items-center gap-2 ${myShopData.isOpen
                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300"
                      : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
                      }`}
                    title="Click to Toggle Status"
                  >
                    <span className={`w-2 h-2 rounded-full ${myShopData.isOpen ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></span>
                    {myShopData.isOpen ? "Open for Orders" : "Currently Closed"}
                  </button>
                  <span className="text-xs text-gray-400 font-medium hidden md:block">(Tap to Change)</span>
                </div>
              </div>
              <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mb-4">
                <MapPin size={16} className="text-orange-500" />
                {myShopData.city}, {myShopData.state}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase">Items</p>
                  <p className="text-lg font-bold text-gray-900">{myShopData.items.length}</p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase">Rating</p>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-gray-900">{stats.rating}</span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => navigate("/partner/orders")}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> View Orders
              </button>
              <button
                onClick={() => navigate("/partner/add-items")}
                className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Item
              </button>
            </div>
          </div>

          {/* 2. Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`₹${stats.revenue}`}
              color="text-green-600"
              subText="+12% this week"
            />
            <StatCard
              icon={DollarSign}
              label="COD Revenue"
              value={`₹${stats.codRevenue || 0}`}
              color="text-pink-600"
              subText="Cash to Collect"
            />

            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={stats.totalOrders}
              color="text-blue-600"
              subText={`${stats.pendingOrders} Active Now`}
            />
            <StatCard
              icon={Utensils}
              label="Menu Items"
              value={myShopData.items.length}
              color="text-orange-600"
              subText="In different categories"
            />
          </div>

       

          {/* 3. Menu Management Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              Menu Management
            </h2>
           
          </div>

          {/* //! Empty State - No Items */}
          {myShopData.items.length === 0 && (
            <div className="w-full flex justify-center py-10">
              <div className="w-full bg-white border border-dashed border-gray-300 rounded-[2rem] p-12 text-center hover:border-orange-300 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => navigate("/partner/add-items")}
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm group-hover:text-orange-500 group-hover:scale-110 transition-all">
                  <Utensils size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Build Your Menu</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Start adding your delicious dishes to let customers browse and order.</p>
                <span className="text-orange-600 font-bold text-sm underline group-hover:no-underline">Add First Item &rarr;</span>
              </div>
            </div>
          )}

          {/* //! Items Grid */}
          {myShopData.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {myShopData.items.map((items, index) => (
                <div key={index} className="transform transition-all hover:translate-y-[-4px]">
                  <OwnerItemCard data={items} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

// No extra export
