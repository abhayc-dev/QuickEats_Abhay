//! Page for AddItems By owner

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../config";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const AddItem = () => {
  const navigate = useNavigate();
  const [name, setName] = useState();
  const [price, setPrice] = useState(0);
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
    <div className="flex justify-center flex-col items-center p-6 min-h-screen bg-[#FAF9F6]">

      {/* //! back */}
      <div
        className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => {
          navigate("/");
        }}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>

      <div className="max-w-lg w-full bg-[#fbf9f3] shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-12 h-12" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">Add Items</div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Item Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              onChange={handleImage}
            />
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt="image"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Category
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">Select Category</option>
              {categories.map((cate) => (
                <option value={cate} key={cate}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Food Type
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
              onChange={(e) => setFoodType(e.target.value)}
              value={foodType}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non Veg</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff4d2d] text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
