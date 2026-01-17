// Card for Cart items
import { FaMinus, FaPlus } from "react-icons/fa6";
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
    <div className="group flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-4 relative overflow-hidden">

      {/* Hover accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Product Info */}
      <div className="flex items-center gap-5 w-full sm:w-auto">
        <div className="relative">
          <img
            src={data.image}
            alt={data.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{data.name}</h3>
          <p className="text-sm text-gray-400 font-medium">
            Single Price: <span className="text-gray-600">₹{data.price}</span>
          </p>
          <p className="font-bold text-orange-600 text-lg mt-1">
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">

        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1">
          <button
            className="w-8 h-8 flex items-center justify-center bg-white text-gray-600 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            onClick={() => handleDecrease(data.id, data.quantity)}
            disabled={data.quantity <= 1}
          >
            <FaMinus size={10} />
          </button>

          <span className="w-10 text-center font-bold text-gray-700">{data.quantity}</span>

          <button
            className="w-8 h-8 flex items-center justify-center bg-gray-600 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm cursor-pointer"
            onClick={() => handleIncrease(data.id, data.quantity)}
          >
            <FaPlus size={10} />
          </button>
        </div>

        <button
          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 cursor-pointer"
          title="Remove Item"
          onClick={() => handleDelete(data.id)}
        >
          <BsTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default CardItemsCard;
