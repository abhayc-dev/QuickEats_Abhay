//! MyOrder Page for Both User and Owner

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import UserOrderCard from "../../components/UserOrderCard";
import OwnerOrderCard from "../../components/OwnerOrderCard";
import { useEffect } from "react";
import { setMyOrders, updateRealtimeStatus } from "../redux/userSlice";
import { useState } from "react";

const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");

  //! get data from socket io from backend  (newOrder)
  useEffect(() => {
    socket?.on("newOrder", (data) => {
      if (userData.role === 'owner' && data.shopOrders.owner._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]));
      } else if (userData.role === 'user' && data.user._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders])); // For user real-time update if needed
      }
    });

    //! socket io from backend to update the status
    socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id || userData.role === 'owner') { // Update for both
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
  }, [socket, userData, myOrders, dispatch]); // Added dependencies

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Preparing", value: "preparing" },
    { label: "Out for Delivery", value: "out of delivery" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const filteredOrders = myOrders?.filter((order) => {
    if (filter === "all") return true;
    // For owner, check shopOrders status. For user, check main status if available or derive it.
    // The data structure for owner vs user might differ slightly based on getMyOrders controller.
    // Owner sees 'shopOrders' as an object (filtered in backend).
    // User sees 'shopOrders' as array.

    if (userData?.role === 'owner') {
      return order.shopOrders?.status === filter;
    } else {
      // rough approximation for user if they have multiple shop orders in one cart?
      // Usually user orders have global status or per-shop status.
      // Let's assume user wants to see if ANY shop order matches or main status.
      // Existing UserOrderCard uses data.shopOrders which is array.
      // Let's stick to simple logic: check if any sub-order matches filter
      return order.shopOrders?.some(so => so.status === filter);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100 mb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors group"
            >
              <IoIosArrowRoundBack size={28} className="text-gray-600 group-hover:text-orange-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Orders</h1>
          </div>
        </div>

        {/* Filter Tabs - Scrollable on mobile */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === opt.value
                    ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Orders List */}
        <div className="space-y-6 pb-20">
          {filteredOrders?.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-md mx-auto mt-10">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                {/* Placeholder Icon */}
                <span className="text-4xl">🧾</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No {filter !== 'all' ? filter : ''} orders</h2>
              <p className="text-gray-500 mb-8">
                {filter === 'all'
                  ? "Looks like you haven't placed any orders yet."
                  : `You have no orders in the "${filter}" status.`}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => navigate("/")}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 py-3 font-medium shadow-lg hover:shadow-orange-200 transition-all duration-300"
                >
                  Start Ordering
                </button>
              )}
            </div>
          ) : (
            filteredOrders?.map((order, index) =>
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
