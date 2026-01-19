//! DeliveryBoy Page

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Nav from "../src/pages/Nav";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../src/config";
import DeliveryAssignmentCard from "../src/pages/DeliveryAssignmentsCard";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { MapPin, Wallet, Package, Phone, CheckCircle, X } from "lucide-react";
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
  const [newOrderModal, setNewOrderModal] = useState(null); // Modal State

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

  //! fetch reject order
  const rejectOrder = async (assignmentId) => {
    try {
      await axios.put(
        `${serverUrl}/api/order/reject-assignment/${assignmentId}`,
        {},
        { withCredentials: true }
      );
      setAvailableAssignments((prev) =>
        prev.filter((a) => a.assignmentId !== assignmentId)
      );
      toast.success("Assignment Rejected");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to reject");
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
        setNewOrderModal(data); // Show Modal
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
    <div className="w-full min-h-screen bg-[#FDFDFD] pb-20">
      <Nav />

      <div className="max-w-2xl mx-auto px-4 pt-6 flex flex-col items-center">

        {/* //! Header Card */}
        <div className="w-full bg-[#111] text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden mb-8 group mt-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-500 "></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Hello, {userData.fullName.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              Ready to deliver happiness? You're online and visible.
            </p>

            <div className="flex gap-4 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 w-fit">
              <div className="flex items-center gap-2 px-3 border-r border-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-300">Live</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={14} className="text-orange-500" />
                <span>
                  {deliveryBoyLocation?.lat?.toFixed(4) ?? userData.location.coordinates[1].toFixed(4)},{' '}
                  {deliveryBoyLocation?.lon?.toFixed(4) ?? userData.location.coordinates[0].toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* //! Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-2">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Earnings</span>
              <h3 className="text-2xl font-black text-gray-900">₹{totalEarning.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
              <Package size={20} />
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Delivered</span>
              <h3 className="text-2xl font-black text-gray-900">{todaysDeliveries.reduce((acc, curr) => acc + curr.count, 0)}</h3>
            </div>
          </div>
        </div>

        {/* //! Chart Section */}
        <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Activity Overview</h3>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Today</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={todaysDeliveries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" vertical={false} />
              <XAxis
                dataKey="hour"
                tickFormatter={(h) => `${h}:00`}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f9f9f9' }}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px"
                }}
              />
              <Bar
                dataKey="count"
                fill="#ff4d2d"
                radius={[6, 6, 6, 6]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* //! Current Mission (Order) */}
        {currentOrder && (
          <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                Live Mission
              </h2>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-red-100">
                Priority High
              </span>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-orange-100 overflow-hidden relative">
              {/* Map/Tracking Placeholder or Actual Component */}
              <div className="relative">
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
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/5 to-transparent"></div>
              </div>

              <div className="p-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-black text-gray-900 border border-gray-200">
                    {currentOrder.user.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{currentOrder.user.fullName}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{currentOrder.deliveryAddress.text}</p>
                  </div>
                  <a href={`tel:${currentOrder.user.mobile}`} className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                    <Phone size={20} />
                  </a>
                </div>

                {/* Items Toggle */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={toggleItemsShow}
                  >
                    <h4 className="font-bold text-gray-700 text-sm">Order Details</h4>
                    <span className="text-xs font-bold text-blue-600">
                      {itemsShow ? 'Hide' : 'View'} {currentOrder.shopOrder.shopOrderItems.length} Items
                    </span>
                  </div>

                  {itemsShow && (
                    <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-3">
                      {currentOrder.shopOrder.shopOrderItems.map((item) => (
                        <div key={item._id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">
                            <span className="text-gray-900 font-bold">x{item.quantity}</span> {item.name}
                          </span>
                          <span className="text-gray-900 font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-dashed border-gray-300 mt-2">
                        <span>Total to Collect</span>
                        <span>₹{currentOrder.shopOrder.subtotal}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* OTP / Action */}
                {!showOtpButton ? (
                  <button
                    className="w-full bg-[#111] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-2"
                    disabled={loader}
                    onClick={sendOtp}
                  >
                    {loader ? <ClipLoader size={24} color="white" /> : (
                      <>
                        <CheckCircle size={20} />
                        Arrived & Verify
                      </>
                    )}
                  </button>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-4">
                      <p className="text-sm font-medium text-gray-500">Enter Delivery PIN from Customer</p>
                    </div>
                    <div className="flex gap-2 justify-center mb-6">
                      <input
                        type="text"
                        placeholder="• • • •"
                        maxLength={4}
                        className="w-full text-center text-3xl font-black tracking-[1em] py-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none transition-colors text-gray-900 placeholder:tracking-widest"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    {message && <p className="text-center text-red-500 text-sm font-bold mb-4 bg-red-50 py-2 rounded-lg">{message}</p>}

                    <button
                      className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-green-200 shadow-xl hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                      onClick={verifyOtp}
                    >
                      Complete Delivery
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* //! Available Orders */}
        {!currentOrder && (
          <div className="w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              Available Orders
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{availableAssignments.length}</span>
            </h2>

            {availableAssignments.length > 0 ? (
              availableAssignments.map((a, index) => (
                <DeliveryAssignmentCard
                  key={index}
                  assignment={a}
                  accept={acceptOrder}
                  reject={rejectOrder}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  <Package size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Orders Yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                  New delivery requests will appear here instantly. Keep this active.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* //! NEW ORDER POPUP MODAL */}
      {
        newOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-300 border border-white/20">

              {/* Header */}
              <div className="bg-[#ff4d2d] p-6 text-white text-center relative">
                <button
                  onClick={() => setNewOrderModal(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-4xl shadow-inner">
                  🛵
                </div>
                <h2 className="text-2xl font-black tracking-tight">New Request!</h2>
                <p className="text-orange-100 text-sm font-medium opacity-90">Grab it before it's gone</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-lg font-bold text-gray-900 border border-orange-100">
                    {newOrderModal.shopName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{newOrderModal.shopName}</h3>
                    <p className="text-xs text-gray-500">Restaurant</p>
                  </div>
                </div>

                <div className="my-4 space-y-3">
                  <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <MapPin size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Deliver To</p>
                      <p className="text-gray-700 text-sm font-medium line-clamp-2 leading-snug">
                        {newOrderModal.deliveryAddress?.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-bold uppercase">Items</p>
                      <p className="font-black text-gray-900 text-lg">{newOrderModal.items?.length || 1}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-bold uppercase">Total Bill</p>
                      <p className="font-black text-gray-900 text-lg">₹{newOrderModal.subtotal}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-bold uppercase">Payment</p>
                      <p className="font-bold text-gray-900 text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-md uppercase">
                        {newOrderModal.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      rejectOrder(newOrderModal.assignmentId);
                      setNewOrderModal(null);
                    }}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      acceptOrder(newOrderModal.assignmentId);
                      setNewOrderModal(null);
                    }}
                    className="flex-1 py-3.5 bg-[#111] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Accept Now
                  </button>
                </div>
              </div>

            </div>
          </div>
        )
      }
    </div>
  );
};

export default DeliveryBoy;
