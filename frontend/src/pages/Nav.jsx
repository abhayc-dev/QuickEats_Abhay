//! THis is a nav bar

import React, { useEffect, useState } from "react";
import { FaLocationDot, FaMicrophone } from "react-icons/fa6";
import { IoMdSearch } from "react-icons/io";
import { BsCart3 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverUrl } from "../config";
import { setSearchItems, setUserData, setCurrentCity } from "../redux/userSlice";
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
  const [isListening, setIsListening] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/shop/cities`);
        setAvailableCities(res.data);
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, []);

  const [query, setQuery] = useState([]);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Browser does not support speech recognition.");
    }
  };

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
    <div className="w-full h-[70px] flex items-center justify-between px-4 md:px-10 fixed top-0 z-50 shadow-sm bg-white/80 backdrop-blur-md border-b border-orange-100 transition-all duration-300">
      {/* //! Logo */}
      <h1
        className="text-2xl md:text-3xl font-black tracking-tight cursor-pointer flex items-center gap-1"
        onClick={() => navigate("/")}
      >
        <span className="text-orange-600">Quick</span><span className="text-yellow-500">Eats</span>
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
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => startListening()}
              >
                {isListening ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                ) : (
                  <FaMicrophone size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          )}

          {/* //! Desktop Search */}
          <div className="hidden md:flex items-center border border-orange-100 shadow-inner rounded-full px-4 py-2.5 w-[50%] lg:w-[40%] bg-orange-50/50 hover:bg-orange-50 focus-within:bg-orange-50 focus-within:ring-2 focus-within:ring-orange-200 transition-all duration-300 relative">
            <FaLocationDot size={18} className="text-orange-500 flex-shrink-0" />

            {/* Location Dropdown */}
            <div className="relative group h-full flex items-center">
              <select
                className="appearance-none bg-transparent text-sm text-gray-600 px-3 border-r border-orange-200 font-medium outline-none cursor-pointer w-32 truncate"
                value={currentCity || ""}
                onChange={(e) => {
                  if (e.target.value === "DETECT_LOCATION") {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                      const { latitude, longitude } = position.coords;
                      // mapSlice
                      // dispatch(setLocation({ lat: latitude, lon: longitude }));
                      const apikey = import.meta.env.VITE_GEOAPIKEY;
                      try {
                        const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`);
                        const city = result?.data?.results[0].city || result?.data?.results[0].county;
                        dispatch(setCurrentCity(city));
                        // dispatch(setCurrentAddress(result?.data?.results[0].formatted));
                      } catch (err) {
                        console.error("Geo error", err);
                      }
                    }, (error) => {
                      alert("Location access denied. Please select manually.");
                    });
                  } else {
                    dispatch(setCurrentCity(e.target.value));
                  }
                }}
              >
                <option value={currentCity} className="font-bold text-orange-600">{currentCity}</option>
                <option disabled>──────────</option>
                <option value="DETECT_LOCATION" className="font-bold text-blue-600">◎ Detect My Location</option>
                <option disabled>──────────</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <IoMdSearch size={22} className="ml-3 text-orange-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for dishes..."
              className="flex-1 ml-2 text-sm outline-none text-gray-700 bg-transparent placeholder-gray-400 font-medium min-w-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="p-1.5 rounded-full hover:bg-orange-200/50 transition-colors flex-shrink-0"
              onClick={() => startListening()}
            >
              {isListening ? (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <FaMicrophone size={16} className="text-orange-400" />
              )}
            </button>
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
              <select
                className="truncate text-sm text-gray-500 appearance-none bg-transparent outline-none max-w-[100px]"
                value={currentCity || ""}
                onChange={(e) => {
                  if (e.target.value === "DETECT_LOCATION") {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                      const { latitude, longitude } = position.coords;
                      const apikey = import.meta.env.VITE_GEOAPIKEY;
                      try {
                        const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`);
                        const city = result?.data?.results[0].city || result?.data?.results[0].county;
                        dispatch(setCurrentCity(city));
                      } catch (err) {
                        console.error("Geo error", err);
                      }
                    });
                  } else {
                    dispatch(setCurrentCity(e.target.value));
                  }
                }}
              >
                <option value={currentCity}>{currentCity}</option>
                <option value="DETECT_LOCATION">◎ Detect Location</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <IoMdSearch size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search delicious food..."
                className="flex-1 text-sm outline-none text-gray-700"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => startListening()}
              >
                {isListening ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                ) : (
                  <FaMicrophone size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          )}

          {/* //! Desktop Search */}
          <div className="hidden md:flex items-center border border-orange-100 shadow-inner rounded-full px-4 py-2.5 w-[50%] lg:w-[40%] bg-orange-50/50 hover:bg-orange-50 focus-within:bg-orange-50 focus-within:ring-2 focus-within:ring-orange-200 transition-all duration-300 relative">
            <FaLocationDot size={18} className="text-orange-500 flex-shrink-0" />
            {/* Location Dropdown */}
            <div className="relative group h-full flex items-center">
              <select
                className="appearance-none bg-transparent text-sm text-gray-600 px-3 border-r border-orange-200 font-medium outline-none cursor-pointer w-32 truncate"
                value={currentCity || ""}
                onChange={(e) => {
                  if (e.target.value === "DETECT_LOCATION") {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                      const { latitude, longitude } = position.coords;
                      const apikey = import.meta.env.VITE_GEOAPIKEY;
                      try {
                        const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`);
                        const city = result?.data?.results[0].city || result?.data?.results[0].county;
                        dispatch(setCurrentCity(city));
                      } catch (err) {
                        console.error("Geo error", err);
                      }
                    }, (error) => {
                      alert("Location access denied");
                    });
                  } else {
                    dispatch(setCurrentCity(e.target.value));
                  }
                }}
              >
                <option value={currentCity} className="font-bold text-orange-600">{currentCity}</option>
                <option disabled>──────────</option>
                <option value="DETECT_LOCATION" className="font-bold text-blue-600">◎ Detect My Location</option>
                <option disabled>──────────</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <IoMdSearch size={22} className="ml-3 text-orange-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for dishes..."
              className="flex-1 ml-2 text-sm outline-none text-gray-700 bg-transparent placeholder-gray-400 font-medium min-w-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="p-1.5 rounded-full hover:bg-orange-200/50 transition-colors flex-shrink-0"
              onClick={() => startListening()}
            >
              {isListening ? (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <FaMicrophone size={16} className="text-orange-400" />
              )}
            </button>
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

            <div
              className="relative hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer hover:bg-[#ff4d2d]/20 transition"
              onClick={() => navigate("/partner/orders")}
            >
              <LuReceiptSwissFranc size={18} />
              <span>My Orders</span>
              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-2 py-0.5 shadow">
                {myOrders.length}
              </span>
            </div>
            <div
              className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 font-medium rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d]"
              onClick={() => navigate("/partner/orders")}
            >
              <LuReceiptSwissFranc size={20} />

              <spam className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1.5px]">
                {myOrders.length}
              </spam>
            </div>
          </>
        )}

        {/* //! User Cart */}
        {/* //! Cart visible for guests and users (not admins) */}
        {(!userData || userData?.role === "user") && (
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
        )}

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
            onClick={() => navigate("/signin")}
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
