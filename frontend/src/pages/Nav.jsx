//! THis is a nav bar

import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import { BsCart3 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverUrl } from "../config";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { FaPlus } from "react-icons/fa6";
import { LuReceiptSwissFranc } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

function Nav() {
  const { userData, currentCity, cartItems, myOrders } = useSelector(
    (state) => state.user
  );
  const { myShopData } = useSelector((state) => state.owner);

  const [showInfo, setShowInfo] = useState(false);
  const [search, setSearch] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [query, setQuery] = useState([]);

  const handleLogOut = async () => {
    try {
      await axios.get(
        `${serverUrl}/api/auth/signout`,
        { withCredentials: true },
        dispatch(setUserData(null))
      );
    } catch (error) {
      console.log(error);
    }
  };

  //! fetch the api for search items
  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
        {
          withCredentials: true,
        }
      );
      dispatch(setSearchItems(result.data));
      // console.log(result.data)
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearchItems();
    } else {
      dispatch(setSearchItems(null));
    }
  }, [query]);

  return (
    <div className="w-full h-[60px] flex items-center justify-between px-4 md:px-10 fixed top-0 z-50 shadow-md bg-gradient-to-t from-gray-100 to-gray-100">

      {/* //! Logo */}
      <h1
        className="text-2xl md:text-3xl font-extrabold text-[#ff4d2d] tracking-wide cursor-pointer"
        onClick={() => navigate("/")}
      >
        Quick<span className="text-gray-600">Eats</span>
      </h1>

       {/* //! Search (mobile toggle + desktop inline)  not user Data */}
      {!userData && (
        <>
          {/* //! Mobile Search */}
          {search && (
            <div className="absolute top-[75px] left-1/2 -translate-x-1/2 w-[90%] bg-white shadow-xl rounded-full flex items-center gap-3 px-4 py-2 md:hidden">
              <FaLocationDot size={20} className="text-[#ff4d2d]" />
              <span className="truncate text-sm text-gray-500">
                {currentCity}
              </span>
              <IoMdSearch size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search delicious food..."
                className="flex-1 text-sm outline-none text-gray-700"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}

          {/* //! Desktop Search */}
          <div className="hidden md:flex items-center border border-[#ff4d2d]/20 shadow-sm rounded-full px-4 py-2 w-[50%] lg:w-[40%] bg-[#FAF9F6]">
            <FaLocationDot size={20} className="text-[#ff4d2d]" />
            <span className="truncate text-sm text-gray-500 px-2 border-r border-gray-300">
              {currentCity}
            </span>
            <IoMdSearch size={20} className="ml-3 text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search for dishes, cuisines..."
              className="flex-1 ml-2 text-sm outline-none text-gray-700 bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </>
      )}


      {/* //! Search (mobile toggle + desktop inline) */}
      {userData?.role === "user" && (
        <>
          {/* //! Mobile Search */}
          {search && (
            <div className="absolute top-[75px] left-1/2 -translate-x-1/2 w-[90%] bg-white shadow-xl rounded-full flex items-center gap-3 px-4 py-2 md:hidden">
              <FaLocationDot size={20} className="text-[#ff4d2d]" />
              <span className="truncate text-sm text-gray-500">
                {currentCity}
              </span>
              <IoMdSearch size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search delicious food..."
                className="flex-1 text-sm outline-none text-gray-700"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}

          {/* //! Desktop Search */}
          <div className="hidden md:flex items-center border border-[#ff4d2d]/20 shadow-sm rounded-full px-4 py-2 w-[50%] lg:w-[40%] bg-[#FAF9F6]">
            <FaLocationDot size={20} className="text-[#ff4d2d]" />
            <span className="truncate text-sm text-gray-500 px-2 border-r border-gray-300">
              {currentCity}
            </span>
            <IoMdSearch size={20} className="ml-3 text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search for dishes, cuisines..."
              className="flex-1 ml-2 text-sm outline-none text-gray-700 bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </>
      )}

      {/* //! Right Section */}
      <div className="flex items-center gap-4 md:gap-6">

         {/* //! Toggle Search (Mobile Only) not userData */}
        {!userData &&
          (search ? (
            <RxCross2
              size={22}
              className="text-red-500 md:hidden cursor-pointer"
              onClick={() => setSearch(false)}
            />
          ) : (
            <IoMdSearch
              size={24}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
              onClick={() => setSearch(true)}
            />
          ))}

        {/* //! Toggle Search (Mobile Only) */}
        {userData?.role === "user" &&
          (search ? (
            <RxCross2
              size={22}
              className="text-red-500 md:hidden cursor-pointer"
              onClick={() => setSearch(false)}
            />
          ) : (
            <IoMdSearch
              size={24}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
              onClick={() => setSearch(true)}
            />
          ))}

        {/* //! Owner Actions */}
        {userData?.role === "owner" && (
          <>
            {myShopData && (
              <>
                <button
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] hover:bg-[#ff4d2d]/20 transition"
                  onClick={() => navigate("/add-items")}
                >
                  <FaPlus size={16} /> Add Item
                </button>
                <button
                  className="md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]"
                  onClick={() => navigate("/add-items")}
                >
                  <FaPlus size={18} />
                </button>
              </>
            )}
            <div
              className="relative hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer hover:bg-[#ff4d2d]/20 transition"
              onClick={() => navigate("/my-orders")}
            >
              <LuReceiptSwissFranc size={18} />
              <span>My Orders</span>
              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-2 py-0.5 shadow">
                {myOrders.length}
              </span>
            </div>
            <div
              className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 font-medium rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={() => navigate("/my-orders")}
            >
              <LuReceiptSwissFranc size={20} />

              <spam className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1.5px]">
                {myOrders.length}
              </spam>
            </div>
          </>
        )}

        {/* //! User Cart */}
        {/* //! Cart visible for all (guests can add items) */}
        <div
          className="relative cursor-pointer"
          onClick={() => navigate("/cart")}
        >
          <BsCart3 size={24} className="text-[#ff4d2d]" />
          {cartItems.length > 0 && (
            <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-1.5 py-0.5 shadow">
              {cartItems.length}
            </span>
          )}
        </div>

        {/* //! Profile */}
        {userData ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-lg shadow cursor-pointer"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            {userData?.fullName?.charAt(0)}
          </div>
        ) : (
          <button
            className="px-3 py-1.5 rounded-lg bg-[#ff4d2d] text-white text-sm font-semibold"
            onClick={() => navigate("/signin/user")}
          >
            Sign In
          </button>
        )}

        {/* //! Dropdown */}
        {userData && showInfo && (
          <div
            className={`absolute top-[75px] right-3 w-48 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 flex flex-col gap-2 text-sm`}
          >
            <div className="font-semibold text-gray-700">
              {userData?.fullName}
            </div>
            {userData?.role === "user" && (
              <div
                className="text-[#ff4d2d] hover:underline cursor-pointer"
                onClick={() => navigate("/my-orders")}
              >
                My Orders
              </div>
            )}
            <div
              className="text-[#ff4d2d] hover:underline cursor-pointer"
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
