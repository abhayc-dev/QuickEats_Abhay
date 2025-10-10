//! Owner Order Card

import React, { useState } from "react";
import { IoMailUnreadOutline } from "react-icons/io5";
import { FcIphone } from "react-icons/fc";
import { IoLocationOutline } from "react-icons/io5";
import axios from "axios";
import { serverUrl } from "../src/config";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../src/redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  //! state for availableBoys
  const [availableBoys, setAvailableBoys] = useState([]);

  const dispatch = useDispatch();
  //! fetch api for update the status
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result?.data?.availableBoys);
      console.log(result.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data.user.fullName}
        </h2>
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <IoMailUnreadOutline className="text-[#ff4d2d]" />
          {data.user.email}
        </p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <FcIphone />
          <span>+91 {data.user.mobile}</span>
        </p>
        {data.paymentMethod == "online" ? (
          <p className="gap-2 text-sm text-gray-500">
            Payment: {data.payment ? "true" : "false"}
          </p>
        ) : (
          <p className="gap-2 text-sm text-gray-500">
            Payment Method: {data.paymentMethod}
          </p>
        )}
      </div>

      <div className="flex items-start flex-col gap-2 text-gray-600 text-sm">
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <IoLocationOutline className="text-[#ff4d2d]" />
          {data?.deliveryAddress?.text}
        </p>
        <p className="text-xs text-gray-500 ml-5">
          Lat: {data?.deliveryAddress.latitude}, Lon:{" "}
          {data?.deliveryAddress.longitude}
        </p>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {data.shopOrders.shopOrderItems.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-40 border rounded-lg p-2 bg-gray-50"
          >
            <img
              src={item.item.image}
              alt=""
              className="w-full h-24 object-cover rounded"
            />
            <p className="text-sm font-semibold mt-1">{item.name}</p>
            <p className="text-xs text-gray-500">
              Qty: {item.quantity} x ₹{item.price}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-300">
        <span className="text-xm">
          Status:{" "}
          <span className="font-semibold capitalize text-[#ff4d2d]">
            {data.shopOrders.status}
          </span>
        </span>

        <select
          className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-1 border-[#ff4d2d] text-[#ff4d2d]"
          onChange={(e) =>
            handleUpdateStatus(
              data._id,
              data.shopOrders.shop._id,
              e.target.value
            )
          }
        >
          <option value={""}>Change Status</option>
          <option value={"pending"}> Pending</option>
          <option value={"preparing"}> Preparing</option>
          <option value={"out of delivery"}> Out Of Delivery</option>
        </select>
      </div>

      {data.shopOrders.status == "out of delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-yellow-50 gap-4 border-amber-300">
          {data.shopOrders.assignedDeliveryBoy ? (
            <p>Assigned Delivery Boy:</p>
          ) : (
            <p>Delivery Boys:</p>
          )}

          {availableBoys?.length > 0 ? (
            availableBoys.map((b, index) => (
              <div className="text-gray-800 flex gap-6 mt-2" key={index}>
                <p>Name: {b.fullName}</p> Mob: {b.mobile}
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? (
            <div className="">
              <span className="font-semibold">Name: </span>
              <span>{data.shopOrders.assignedDeliveryBoy.fullName}</span> |{" "}
              <span className="font-semibold">Mobile: </span>
              <span>{data.shopOrders.assignedDeliveryBoy.mobile}</span>
            </div>
          ) : (
            <div>Waiting for delivery boy to accept</div>
          )}
        </div>
      )}

      <div className="font-bold text-right text-sm text-gray-700">
        Total: ₹{data.shopOrders.subtotal}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
