//! MyOrder Page for Both User and Owner

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import UserOrderCard from "../../components/UserOrderCard";
import OwnerOrderCard from "../../components/OwnerOrderCard";
import { useEffect } from "react";
import { setMyOrders, updateRealtimeStatus } from "../redux/userSlice";

const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //! get data from socket io from backend  (newOrder)
  useEffect(() => {
    socket?.on("newOrder", (data) => {
      if (data.shopOrders.owner._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]));
      }
    });

    //! socket io from backend to update the status
    socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealtimeStatus({ orderId, shopId, status }));
      }
    });

    //! New: Delivery Partner Assigned (For User)
    socket?.on("delivery-partner-assigned", ({ orderId, shopId, deliveryBoy }) => {
      dispatch(updateRealtimeStatus({ orderId, shopId, deliveryBoy }));
    });

    //! New: Assignment Accepted (For Owner)
    socket?.on("assignment-accepted", ({ orderId, shopId, deliveryBoy }) => {
      dispatch(updateRealtimeStatus({ orderId, shopId, deliveryBoy }));
    });

    return () => {
      socket?.off("newOrder");
      socket?.off("update-status");
      socket?.off("delivery-partner-assigned");
      socket?.off("assignment-accepted");
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <IoIosArrowRoundBack size={28} className="text-gray-600 group-hover:text-orange-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Orders</h1>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Orders List */}
        <div className="space-y-6 pb-20">
          {myOrders?.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-md mx-auto mt-10">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BsShopWindow className="text-4xl text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-8">
                Looks like you haven't placed any orders yet. Start exploring delicious food now!
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 py-3 font-medium shadow-lg hover:shadow-orange-200 transition-all duration-300"
              >
                Start Ordering
              </button>
            </div>
          ) : (
            myOrders?.map((order, index) =>
              userData?.role === "user" ? (
                <UserOrderCard data={order} id={index} key={index} />
              ) : userData?.role === "owner" ? (
                <OwnerOrderCard data={order} id={index} key={index} />
              ) : null
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
