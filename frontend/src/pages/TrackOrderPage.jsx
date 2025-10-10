//! Track Order Page 

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../config";
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "../../components/DeliveryBoyTracking";
import { useSelector, useDispatch } from "react-redux";
import { updateRealtimeStatus } from "../redux/userSlice";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = React.useState();
  const navigate = useNavigate();
  const [userDetailsShow, setUserDetailsShow] = React.useState(false);
  const {socket} = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [liveLocation, setLiveLocation] = useState({})

  const toggleItemsShow = () => {
    setUserDetailsShow(!userDetailsShow);
  };
  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        {
          withCredentials: true,
        }
      );
      setCurrentOrder(result.data);
      console.log("order by id", result.data);
    } catch (error) {
      console.log("error in fetching order by id", error);
    }
  };

    //! listen the socket io , come from socket.js
    useEffect(() => {
        socket.on('updateDeliveryLocation', ({deliveryBoyId, latitude, longitude}) => {
         setLiveLocation(prev => ({
           ...prev,
           [deliveryBoyId] : {lat:latitude, lon:longitude}
         }))
        })
    },[socket])

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  // realtime status on track page, update local state too
  useEffect(() => {
    if (!socket) return;
    const handler = ({ orderId: oid, shopId, status }) => {
      // update redux store
      dispatch(updateRealtimeStatus({ orderId: oid, shopId, status }));
      // also update local currentOrder for immediate reflect
      setCurrentOrder((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (Array.isArray(updated.shopOrders)) {
          updated.shopOrders = updated.shopOrders.map((so) =>
            String(so.shop._id || so.shop) === String(shopId)
              ? { ...so, status }
              : so
          );
        }
        return updated;
      });
    };
    socket.on('update-status', handler);
    socket.on('orderDelivered', handler);
    return () => {
      socket.off('update-status', handler);
      socket.off('orderDelivered', handler);
    };
  }, [socket, dispatch]);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-[#FAF9F6]">

      {/* //! Back button */}
      <div
        className="absolute flex items-center top-6 left-6 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
        <h1 className="ml-2 text-xl font-semibold">Track Order</h1>
      </div>

      {currentOrder?.shopOrders?.map((shopOrder, index) => {
        return (
          <div
            key={index}
            className="w-full max-w-2xl bg-gray-50 mt-12 rounded-2xl shadow-lg border border-orange-100 p-6 mb-6 transition hover:shadow-xl"
          >
            {/* //! Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-2">
              <h2 className="text-xl font-bold text-[#ff4d2d]">
                🏪 {shopOrder.shop.name}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  shopOrder.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {shopOrder.status}
              </span>
            </div>

            {/* //! Items */}
            <div className="space-y-1">
              <p className="text-gray-700">
                <span className="font-semibold">Items:</span>{" "}
                {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}{" "}
              </p>
            </div>

            {/* //! Price + Address */}
            <div className="mb-4">
              <p className="text-gray-800 font-semibold">
                Subtotal:{" "}
                <span className="text-[#ff4d2d]">₹{shopOrder.subtotal}</span>
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Delivery address:</span>{" "}
                {currentOrder.deliveryAddress?.text}
              </p>
              <div className="flex justify-end font-monos text-xs text-gray-600">
                <span
                  className="cursor-pointer hover:underline hover:text-blue-500 "
                  onClick={toggleItemsShow}
                >
                  Owner Details
                </span>
              </div>
            </div>

            {/* //! Owner Details */}
            {userDetailsShow && (
              <div className="bg-orange-50 p-2 rounded-xl flex items-center gap-4 border border-orange-100 mb-2">
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-orange-200 text-[#ff4d2d] font-bold text-lg">
                  {shopOrder.owner.fullName.charAt(0)}
                </div>
                <div>
                  <p className=" text-gray-700">
                    <span className="font-semibold">Shop Owner</span>:{" "}
                    {shopOrder.owner.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    📞 {shopOrder.owner.mobile}
                  </p>
                  <p className="text-sm text-gray-600">
                    📧 {shopOrder.owner.email}
                  </p>
                </div>
              </div>
            )}

            {/* //! Delivery Boy Info */}
            {shopOrder.status !== "delivered" ? (
              shopOrder.assignedDeliveryBoy ? (
                <div className="bg-orange-50 p-2 rounded-xl flex items-center gap-4 border border-orange-100">
                  <div className="h-9 w-9 flex items-center justify-center rounded-full bg-orange-200 text-[#ff4d2d] font-bold text-lg">
                    {shopOrder.assignedDeliveryBoy.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className=" text-gray-700">
                      <span className="font-semibold">Delivery Boy</span>:{" "}
                      {shopOrder.assignedDeliveryBoy.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {shopOrder.assignedDeliveryBoy.mobile}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="font-semibold text-yellow-700">
                  🚚 Delivery Boy is not assigned yet.
                </p>
              )
            ) : (
              <p className="text-green-600 font-semibold text-lg">
                ✅ Delivered
              </p>
            )}

            {/* //! Map/Tracking */}
        
            {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" ? (
              <div className="mt-4">
                
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation:liveLocation[shopOrder.assignedDeliveryBoy._id] || {
                      lat: shopOrder.assignedDeliveryBoy.location
                        .coordinates[1],
                      lon: shopOrder.assignedDeliveryBoy.location
                        .coordinates[0],
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude,
                    },
                  }}
                />
              </div>
            ) : null}
            
          </div>
        );
      })}
    </div>
  );
};

export default TrackOrderPage;
