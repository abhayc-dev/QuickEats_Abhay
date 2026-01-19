import { Edit2, Trash2 } from 'lucide-react';
import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../src/config";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../src/redux/ownerSlice";

//! data comes from OwnerDashBoard
const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //! fetch the delete api.
  const handelDeleteItem = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/delete/${data._id}`,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full">
      <div className="w-32 sm:w-40 bg-gray-100 relative overflow-hidden">
        <img src={data.image} alt={data.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {data.description && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
            <p className="text-white text-xs font-bold">{data.description}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${data.foodType === 'Veg' || data.foodType === 'veg'
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-red-50 text-red-700 border-red-100'
              }`}>
              {data.foodType}
            </span>
            <span className="text-[10px] text-gray-500 font-bold px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100 uppercase tracking-wide">
              {data.category}
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {data.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-black text-gray-900">
              ₹{data.discount > 0 ? Math.round(data.price - (data.price * data.discount / 100)) : data.price}
            </span>
            {data.discount > 0 && (
              <>
                <span className="text-xs text-gray-400 line-through font-medium">₹{data.price}</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                  {data.discount}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => navigate(`/partner/edit-items/${data._id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 rounded-lg hover:bg-black hover:text-white transition-all border border-gray-100"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={handelDeleteItem}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
