//! This is a Create and Edit Page

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Store, UploadCloud, MapPin, Navigation, ArrowRight } from "lucide-react";
import axios from "axios";
import { serverUrl } from "../config";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user
  );

  const [name, setName] = useState(myShopData?.name || "");
  const [city, setCity] = useState(myShopData?.city || currentCity);
  const [state, setState] = useState(myShopData?.state || currentState);
  const [address, setAddress] = useState(myShopData?.address || currentAddress);
  const [frontendImage, setFrontendImage] = useState(
    myShopData?.frontendImage || null
  );
  const [backendImage, setBackendImage] = useState(null);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = response.data;
            const addressObj = data.address;

            setCity(
              addressObj.city ||
              addressObj.town ||
              addressObj.village ||
              addressObj.hamlet ||
              ""
            );
            setState(addressObj.state || "");

            const detectedAddress = [
              addressObj.house_number,
              addressObj.road,
              addressObj.suburb,
              addressObj.neighbourhood,
            ]
              .filter(Boolean)
              .join(", ");

            setAddress(detectedAddress || data.display_name);
          } catch (error) {
            console.error("Error fetching address:", error);
          } finally {
            setDetectingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setDetectingLocation(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
      setLoading(false)
      navigate("/")

    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        setLoading(false)
      } else {
        console.error("Axios error:", error.message);
        setLoading(false)
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 flex flex-col items-center">

      {/* Back Button */}
      <div className="w-full max-w-lg mb-6 flex justify-start">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-[#ff4d2d] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="w-full max-w-lg bg-white shadow-2xl rounded-[2rem] p-8 sm:p-10 border border-gray-100 relative overflow-hidden">

        {/* Background Blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-100 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200 rotation-3">
              <Store size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {myShopData ? "Update Restaurant" : "Setup Restaurant"}
            </h1>
            <p className="text-gray-500 mt-2">
              {myShopData ? "Update your details to keep customers informed." : "Fill in the details to launch your business."}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Restaurant Name</label>
              <input
                type="text"
                placeholder="e.g. The Burger Joint"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Cover Image</label>
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div className={`w-full h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${frontendImage ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50 group-hover:border-orange-300 group-hover:bg-orange-50/30'}`}>
                  {frontendImage ? (
                    <div className="relative w-full h-full">
                      <img src={frontendImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                          <UploadCloud size={24} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={28} />
                      </div>
                      <p className="text-sm font-bold text-gray-600">Click to upload cover image</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Location Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">State</label>
                <input
                  type="text"
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                  onChange={(e) => setState(e.target.value)}
                  value={state}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">City</label>
                <input
                  type="text"
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                  onChange={(e) => setCity(e.target.value)}
                  value={city}
                />
              </div>
            </div>

            {/* Address & Detect */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Address</label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md hover:bg-orange-100 transition-colors"
                  disabled={detectingLocation}
                >
                  <Navigation size={10} className={detectingLocation ? "animate-spin" : ""} />
                  {detectingLocation ? "LOCATING..." : "USE CURRENT LOCATION"}
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full street address"
                  className="w-full px-5 py-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                  required
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#111] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-orange-600 hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 mt-4"
              disabled={loading}
            >
              {loading ? <ClipLoader size={24} color="white" /> : (
                <>
                  Save & Continue <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditShop;
