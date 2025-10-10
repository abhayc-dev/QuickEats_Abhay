//! Card for Cart items

import { FaMinus } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { BsTrash } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { deleteQuantity, updateQuantity } from "../src/redux/userSlice";

const CardItemsCard = ({ data }) => {
  const dispatch = useDispatch();
  const handleIncrease = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }));
  };

  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }));
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteQuantity({ id }));
  };


  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow border border-amber-500">

      {/* //! leftSide */}
      <div className="flex items-center gap-4">
        <img
          src={data.image}
          alt=""
          className="w-20 h-20 object-cover rounded-lg border border-amber-500 "
        />
        <div>
          <h1 className="font-medium text-gray-800">{data.name}</h1>
          <p className="text-sm text-gray-500">
            ₹{data.price} x {data.quantity}
          </p>
          <p className="font-bold text-gray-900">
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>

      {/* //! rightSide */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 cursor-pointer bg-gray-200 rounded-full hover:bg-gray-300"
          onClick={() => handleDecrease(data.id, data.quantity)}
        >
          <FaMinus size={12} />
        </button>
        <span>{data.quantity}</span>
        <button
          className="p-2 cursor-pointer bg-gray-200 rounded-full hover:bg-gray-300"
          onClick={() => handleIncrease(data.id, data.quantity)}
        >
          <FaPlus size={12} />
        </button>
        <button
          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
          onClick={() => handleDelete(data.id)}
        >
          <BsTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CardItemsCard;
