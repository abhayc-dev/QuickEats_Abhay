//! Owner DashBoard Page

import React, { useEffect } from "react";
import Nav from "../src/pages/Nav";
import { useSelector, useDispatch } from "react-redux";
import { MdRestaurant } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit } from "react-icons/fi";
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
    <div className="w-full min-h-screen flex flex-col items-center">
      <Nav />

      {!myShopData ? (
        // ! Display when not any Shop Data
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <MdRestaurant className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platform and reach thousands of hungry
                customers every day.
              </p>
              <button
                className="
                  px-5 py-2 sm:px-6 
                  font-medium text-white bg-[#ff4d2d] rounded-full shadow-md 
                  transform transition-all duration-200 ease-in-out 
                  hover:bg-orange-600 
                  active:scale-95 active:shadow-sm"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      ) : (
        //! Display, When have a Shop Data
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <MdRestaurant className="text-[#ff4d2d] w-14 h-14" />
            Welcome to {myShopData.name}
          </h1>

          <div className="bg-gray shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">

            {/* //! For Edit Shop */}
            <div
              className="absolute top-4 right-3 text-[#f5674e] shadow-lg hover:text-orange-600 transition-colors cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FiEdit size={30} />
            </div>

            {/* //! Image of Shop */}
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-1">
                {myShopData.name}
              </h1>
              <p className="text-gray-400">
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-400">{myShopData.address}</p>
            </div>
          </div>

          {/* //! add item show when item == 0 */}
          {myShopData.items.length == 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-gray-100 shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <MdRestaurant className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Add Your Food Items
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Every dish tells a story. Add your latest chapter to our
                    menu and share it with the world.
                  </p>
                  <button
                    className="
                  px-5 py-2 sm:px-6 
                  font-medium text-white bg-[#ff4d2d] rounded-full shadow-md 
                  transform transition-all duration-200 ease-in-out 
                  hover:bg-orange-600 
                  active:scale-95 active:shadow-sm"
                    onClick={() => navigate("/add-items")}
                  >
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* //! Show the items (Card from OwnerItemCard) */}
          {myShopData.items.length > 0 && (
            <div className="flex flex-col items-center w-full p-4 max-w-3xl">
              {myShopData.items.map((items, index) => (
                <OwnerItemCard data={items} key={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
