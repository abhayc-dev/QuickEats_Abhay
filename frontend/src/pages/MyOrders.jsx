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

    return () => {
      socket?.off("newOrder");
      socket?.off("update-status");
    };
  }, [socket]);

  return (
    <div className="w-full min-h-screen flex justify-center px-4 bg-[#FAF9F6] ">
      <div className="w-full max-w-[800px] p-4">
        {/* //! Back button */}
        <div className="flex items-center gap-[20px] mb-6">
          <div
            onClick={() => {
              navigate("/");
            }}
          >
            <IoIosArrowRoundBack
              size={35}
              className="text-[#ff4d2d] cursor-pointer"
            />
          </div>
          <h1 className="text-2xl font-bold ">My Orders</h1>
        </div>

        <div className="space-y-6">
          {myOrders?.map((order, index) =>
            userData?.role == "user" ? (
              <UserOrderCard data={order} id={index} />
            ) : userData?.role == "owner" ? (
              <OwnerOrderCard data={order} id={index} key={index} />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
