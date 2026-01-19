//! Page for AddItems By owner

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Utensils, UploadCloud, IndianRupee, Plus, LayoutList, Leaf } from "lucide-react";
import axios from "axios";
import { serverUrl } from "../config";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const AddItem = () => {
  const navigate = useNavigate();
  const [name, setName] = useState();
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("Veg");

  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const categories = [
    "Snack",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "Fast Food",
    "Others",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);
      formData.append("discount", discount);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        setLoading(false);
      } else {
        console.error("Axios error:", error.message);
        setLoading(false);
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
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-200">
              <Utensils size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Add New Item
            </h1>
            <p className="text-gray-500 mt-2">
              Expand your menu with a new delicious option.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Item Name</label>
              <input
                type="text"
                placeholder="e.g. Cheese Pizza"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Item Image</label>
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${frontendImage ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50 group-hover:border-orange-300 group-hover:bg-orange-50/30'}`}>
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
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-600">Upload Image</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Price & Discount Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Price (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-5 py-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                    onChange={(e) => setPrice(e.target.value)}
                    value={price}
                  />
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                    onChange={(e) => setDiscount(e.target.value)}
                    value={discount}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                </div>
              </div>
            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1 flex items-center gap-1">
                  <LayoutList size={12} /> Category
                </label>
                <div className="relative">
                  <select
                    className="w-full px-5 py-3 appearance-none bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                  >
                    <option value="">Select</option>
                    {categories.map((cate) => (
                      <option value={cate} key={cate}>{cate}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
              </div>

              {/* Food Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1 flex items-center gap-1">
                  <Leaf size={12} /> Type
                </label>
                <div className="relative">
                  <select
                    className="w-full px-5 py-3 appearance-none bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700"
                    onChange={(e) => setFoodType(e.target.value)}
                    value={foodType}
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non Veg</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
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
                  <Plus size={20} /> Add Item
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
