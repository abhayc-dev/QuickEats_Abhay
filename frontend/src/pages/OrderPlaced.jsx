//! Order Placed Page 

import Lottie from "lottie-react";
import checkmarkAnimation from "../assets/checkmark.json"; 
import { useNavigate } from "react-router-dom";

function OrderPlaced() {
     const navigate = useNavigate()

  return (
    <div className='min-h-screen flex flex-col justify-center items-center px-4 text-center relative overflow-hidden bg-[#FAF9F6]'>
      
      {/* //! Replace FaCircleCheck with Lottie */}
      <Lottie 
        animationData={checkmarkAnimation} 
        loop={false} // Important: make it play only once
        style={{ width: 150, height: 150 }} // Adjust size as needed
      />
      
      <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed!</h1>
      
      <p className='text-gray-600 max-w-md mb-6'>
        Thank you for your purchase. Your order is being prepared.
        <br/>
        You can track your order status in the "My Orders" section.
      </p>

      <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition'
         onClick={() => navigate("/my-orders")}
      >
        Back to my orders
      </button>
    
    </div>
  )
}

export default OrderPlaced;