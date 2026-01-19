//! Owner DashBoard Page

import React, { useEffect } from "react";
import Nav from "../src/pages/Nav";
import { useSelector, useDispatch } from "react-redux";
import { Store, MapPin, Edit3, Plus, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../src/config";
import { setMyShopData } from "../src/redux/ownerSlice";
import OwnerItemCard from "./OwnerItemCard";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] pb-20 mt-20">
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
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-20">

          {/* Shop Header */}
          <div className="relative w-full h-[320px] rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 group bg-gray-900">
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-8 text-white w-full flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-black mb-3 tracking-tighter">{myShopData.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                    <MapPin size={14} className="text-orange-400" /> {myShopData.city}, {myShopData.state}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                    <Utensils size={14} className="text-orange-400" /> {myShopData.items.length} Items Listed
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/partner/create-edit-shop")}
                className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white text-white hover:text-black p-4 rounded-full transition-all shadow-lg hover:rotate-12"
                title="Edit Shop Details"
              >
                <Edit3 size={24} />
              </button>
            </div>
          </div>

          {/* New Item Action Bar */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
              Menu Items
            </h2>
            <button
              className="
                  px-6 py-3
                  font-bold text-sm text-white bg-black rounded-xl shadow-lg 
                  hover:bg-orange-600 transition-all duration-300
                  active:scale-95 flex items-center gap-2"
              onClick={() => navigate("/partner/add-items")}
            >
              <Plus size={18} /> Add New Item
            </button>
          </div>

          {/* //! Empty State - No Items */}
          {myShopData.items.length === 0 && (
            <div className="w-full flex justify-center py-10">
              <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-[2rem] p-12 text-center hover:bg-white hover:border-orange-300 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => navigate("/partner/add-items")}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm group-hover:text-orange-500 group-hover:scale-110 transition-all">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {myShopData.items.map((items, index) => (
                <div key={index} className="transform transition-all hover:scale-[1.02]">
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
