//! DeliveryBoy Page

import React, { useEffect, useState } from "react";
import Nav from "../src/pages/Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../src/config";
import DeliveryAssignmentCard from "../src/pages/DeliveryAssignmentsCard";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { MapPin } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClipLoader } from "react-spinners";

const DeliveryBoy = () => {
  const { userData, socket } = useSelector((state) => state.user);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpButton, setShowOtpButton] = useState(false);
  const [itemsShow, setItemsShow] = useState(false);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todaysDeliveries, setTodaysDeliveries] = useState([]);
  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState("");

  //! socket io for location of the deliveryBoy fetch without refresh on the user side (is ko listen karenge socket.js me)
  useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return;

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setDeliveryBoyLocation({ lat: latitude, lon: longitude });
          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, // cache for 10s
          timeout: 10000, // wait max 10s
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userData]);

  const toggleItemsShow = () => {
    setItemsShow(!itemsShow);
  };

  // !  Total Earning
  const ratePerDelivery = 50;
  const totalEarning = todaysDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0
  );

  //! fetch available assignments
  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignments(result.data);
      console.log("get assignment", result.data);
    } catch (error) {
      console.log(error);
    }
  };

  //! fetch the api send OTP
  const sendOtp = async () => {
      setLoader(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder.orderId,
          shopOrderId: currentOrder.shopOrder._id,
        },
        {
          withCredentials: true,
        }
      );
      setLoader(false);
      setShowOtpButton(true);
      console.log("otp", result.data);
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };

  //! verify delivery otp
  const verifyOtp = async () => {
      setMessage("")
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder.orderId,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        {
          withCredentials: true,
        }
      );
      // console.log("verify otp", result.data);
      setMessage(result.data.message);
      location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  //! fetch current order
  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
      console.log("get current order", result.data);
    } catch (error) {
      console.log(error);
    }
  };

  //! fetch accept order
  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.put(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
          {}, // request body (empty)
        { withCredentials: true }
      );
      // setAvailableAssignments(result.data);
      console.log("accept order", result.data);
      await getCurrentOrder();
    } catch (error) {
       console.log(error.response?.data || error.message);
    }
  };

  //! fetch the todays deliveries of DeliveryBoy
  const handleTodaysDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-todays-deliveries`,
        {
          withCredentials: true,
        }
      );
      console.log(result.data);
      setTodaysDeliveries(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  //! listen the socket io , come from backend (get newAssignment)
  useEffect(() => {
    socket?.on("newAssignment", (data) => {
      if (data.sendTo == userData._id) {
        setAvailableAssignments((prev) => [...prev, data]);
      }
    });

    return () => {
      socket?.off("newAssignment");
    };
  }, [socket]);

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
    handleTodaysDeliveries();
  }, [userData]);

  return (
    
    <div className="w-full min-h-screen flex flex-col items-center">
  <Nav />

  <div className="w-full max-w-[850px] flex flex-col gap-6 items-center mt-6">

    {/* //! Greeting Card */}
    <div className="bg-white rounded-3xl shadow-xl p-7 flex flex-col items-center w-[90%] border border-orange-200 text-center gap-4 hover:shadow-2xl transition-all duration-300">
      <h1 className="text-3xl font-extrabold text-[#ff4d2d] tracking-tight">
        👋 Hey {userData.fullName.split(" ")[0]}, let’s deliver happiness today!
      </h1>
      <p className="text-gray-500 text-sm">
        Your journey starts here. Keep moving, keep earning 🚀
      </p>
      <div className="flex gap-12 text-gray-700 text-sm items-center mt-3">
        <div className="flex flex-col items-center">
          <MapPin className="text-[#ff4d2d]" size={22} />
          <span className="font-semibold">Latitude</span>
          <span className="text-gray-600">
            {deliveryBoyLocation?.lat ?? userData.location.coordinates[1]}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <MapPin className="text-[#ff4d2d]" size={22} />
          <span className="font-semibold">Longitude</span>
          <span className="text-gray-600">
            {deliveryBoyLocation?.lon ?? userData.location.coordinates[0]}
          </span>
        </div>
      </div>
    </div>

    {/* //! Today’s Delivery */}
    <div className="bg-white rounded-3xl shadow-lg p-6 w-[90%] border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#ff4d2d]">📦 Today’s Delivery</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

       {/* //! Graph */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={todaysDeliveries}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
          <XAxis
            dataKey="hour"
            tickFormatter={(h) => `${h}:00`}
            tick={{ fontSize: 12, fill: "#555" }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#555" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fffbf7",
              border: "1px solid #ffd5c2",
              borderRadius: "8px",
            }}
            formatter={(value) => [`${value} orders`, "🛒"]}
            labelFormatter={(label) => `${label}:00`}
          />
          <Bar
            dataKey="count"
            fill="#ff4d2d"
            radius={[10, 10, 0, 0]}
            barSize={28}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-5 flex items-center justify-between bg-orange-50 rounded-2xl px-5 py-4">
        <p className="text-sm text-gray-700">💰 Total Earnings Today</p>
        <p className="text-xl font-bold text-[#ff4d2d]">
          ₹{totalEarning.toLocaleString()}
        </p>
      </div>
    </div>

    {/* //! Available Orders */}
    <div className="bg-white rounded-3xl shadow-lg p-6 w-[90%] border border-orange-200 mb-6">
      <h1 className="text-2xl font-bold mb-4 text-[#ff4d2d]">🛍 Available Orders</h1>
      {!currentOrder && (
        <div className="p-4">
          {availableAssignments.length > 0 ? (
            availableAssignments.map((a, index) => (
              <DeliveryAssignmentCard
                key={index}
                assignment={a}
                accept={acceptOrder}
              />
            ))
          ) : (
            <div className="bg-orange-50 rounded-2xl border border-dashed border-orange-200 p-6">
              <p className="text-gray-600 text-center font-medium">
                🚫 No available assignments at the moment. Stay tuned!
              </p>
            </div>
          )}
        </div>
      )}

      {currentOrder && (
        <div className="bg-orange-50 rounded-2xl p-5 shadow-md">
          <h2 className="text-xl font-bold mb-3 text-[#ff4d2d]">📦 Current Order</h2>
          <div className="border rounded-lg p-4 mb-3 bg-white">
            <p className="font-semibold text-red-600">🏪 {currentOrder?.shop.name}</p>

            <div className="flex items-center gap-2 mt-1">
              <div className="h-7 w-7 flex items-center justify-center rounded-full bg-orange-200 text-[#ff4d2d] font-bold text-base">
                {currentOrder.user.fullName.charAt(0)}
              </div>
              <p className="font-semibold text-gray-800">
                {currentOrder?.user?.fullName}
              </p>
            </div>
            <p className="text-sm text-gray-600">📞 {currentOrder.user.mobile}</p>
            <p className="text-sm text-gray-600">📍 {currentOrder.deliveryAddress.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              Items: {currentOrder.shopOrder.shopOrderItems.length} | Subtotal: ₹
              {currentOrder.shopOrder.subtotal}
            </p>

            <div className="flex justify-end text-xs text-gray-600">
              <span
                className="cursor-pointer hover:underline hover:text-blue-500"
                onClick={toggleItemsShow}
              >
                {itemsShow ? "Hide Items" : "Show Items"}
              </span>
            </div>
          </div>

          {itemsShow && (
            <div className="border rounded-xl p-4 mb-4 bg-white">
              <h3 className="font-semibold text-sm mb-2">🛒 Order Items</h3>
              <ul className="space-y-2">
                {currentOrder.shopOrder.shopOrderItems.map((item) => (
                  <li key={item._id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <DeliveryBoyTracking
            data={{
              deliveryBoyLocation: deliveryBoyLocation || {
                lat: userData.location.coordinates[1],
                lon: userData.location.coordinates[0],
              },
              customerLocation: {
                lat: currentOrder.deliveryAddress.latitude,
                lon: currentOrder.deliveryAddress.longitude,
              },
            }}
          />

          {!showOtpButton ? (
            <button
              className="mt-4 w-full bg-green-500 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
               disabled={loader}
              onClick={sendOtp}
            >
             {loader? <ClipLoader size={20} color="white"/> :  "✅ Mark As Delivered"}

            </button>
          ) : (
            <div className="mt-4 p-4 flex flex-col border rounded-xl bg-white">
              <p className="text-sm text-gray-600 text-center">
                Enter OTP sent to{" "}
                <span className="font-semibold text-orange-600">
                  {currentOrder.user.fullName}
                </span>
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

             {message && <p className="text-center text-green-400 mt-1">{message}</p>}

              <button
                className="mt-4 w-full bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-blue-600 active:scale-95 transition-all duration-200"
               
                onClick={verifyOtp}
              >
                🔐 Verify OTP & Complete Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</div>

  );
};

export default DeliveryBoy;
