//! Track Order Page
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../config";
import { IoIosArrowRoundBack, IoMdTime, IoMdCall, IoMdMail } from "react-icons/io";
import { MdDeliveryDining, MdStorefront, MdLocationOn, MdCheckCircle, MdPending } from "react-icons/md";
import DeliveryBoyTracking from "../../components/DeliveryBoyTracking";
import { useSelector, useDispatch } from "react-redux";
import { updateRealtimeStatus } from "../redux/userSlice";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = React.useState();
  const navigate = useNavigate();
  const [userDetailsShow, setUserDetailsShow] = React.useState(false);
  const { socket } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [liveLocation, setLiveLocation] = useState({});

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
    if (socket) {
      socket.on("updateDeliveryLocation", ({ deliveryBoyId, latitude, longitude }) => {
        setLiveLocation((prev) => ({
          ...prev,
          [deliveryBoyId]: { lat: latitude, lon: longitude },
        }));
      });
    }
  }, [socket]);

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
    socket.on("update-status", handler);
    socket.on("orderDelivered", handler);

    socket.on("delivery-partner-assigned", ({ orderId: oid, shopId, deliveryBoy }) => {
      if (oid === orderId) {
        setCurrentOrder((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          if (Array.isArray(updated.shopOrders)) {
            updated.shopOrders = updated.shopOrders.map((so) =>
              String(so.shop._id || so.shop) === String(shopId)
                ? { ...so, assignedDeliveryBoy: deliveryBoy }
                : so
            );
          }
          return updated;
        });
      }
    });

    socket.on("otp-generated", ({ orderId: oid, shopOrderId, deliveryOtp }) => {
      if (oid === orderId) {
        setCurrentOrder((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          if (Array.isArray(updated.shopOrders)) {
            updated.shopOrders = updated.shopOrders.map((so) =>
              String(so._id) === String(shopOrderId)
                ? { ...so, deliveryOtp } // Update OTP
                : so
            );
          }
          return updated;
        });
      }
    });

    return () => {
      socket.off("update-status", handler);
      socket.off("orderDelivered", handler);
      socket.off("delivery-partner-assigned");
      socket.off("otp-generated");
    };
  }, [socket, dispatch, orderId]);

  const steps = ["pending", "preparing", "out for delivery", "delivered"];

  const getStepIndex = (status) => {
    let normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === "out of delivery") normalizedStatus = "out for delivery";
    return steps.indexOf(normalizedStatus) !== -1 ? steps.indexOf(normalizedStatus) : 0;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'out for delivery':
      case 'out of delivery': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'preparing': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* //! Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <IoIosArrowRoundBack size={28} className="text-gray-600 group-hover:text-orange-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Track Your Order</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {currentOrder?.shopOrders?.map((shopOrder, index) => {
          const currentStep = getStepIndex(shopOrder.status);

          return (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                    <MdStorefront size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{shopOrder.shop.name}</h2>
                    <p className="text-sm text-gray-500">Shop ID: #{shopOrder.shop._id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize border ${getStatusColor(shopOrder.status)}`}>
                  {shopOrder.status}
                </div>
              </div>

              {/* Delivery OTP Display (Backup for Email) */}
              {shopOrder.deliveryOtp && shopOrder.status !== "delivered" && (
                <div className="mx-6 sm:mx-8 mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      <MdCheckCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Verification Code</p>
                      <p className="text-xs text-gray-500">Share this PIN with the delivery partner upon arrival.</p>
                    </div>
                  </div>
                  <div className="bg-white px-6 py-2 rounded-xl border-2 border-orange-100 shadow-sm">
                    <span className="text-2xl font-black text-gray-800 tracking-[0.3em] font-mono">
                      {shopOrder.deliveryOtp}
                    </span>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="px-6 sm:px-8 py-8 bg-gray-50/30 border-b border-gray-100">
                <div className="relative">
                  {/* Line */}
                  <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full" />
                  <div
                    className="absolute top-4 left-0 h-1 bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {steps.map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 ${i <= currentStep ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white border-gray-300 text-gray-300'
                          }`}>
                          {i < currentStep ? (
                            <MdCheckCircle size={16} />
                          ) : i === currentStep ? (
                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${i <= currentStep ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
                {/* Delivery Info */}
                <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MdLocationOn /> Delivery Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Destination Address</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {currentOrder.deliveryAddress?.text}
                      </p>
                    </div>

                    {/* Delivery Boy */}
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-2">Delivery Partner</p>
                      {shopOrder.assignedDeliveryBoy ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                            👨‍✈️
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{shopOrder.assignedDeliveryBoy.fullName}</p>
                            <a href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                              <IoMdCall /> {shopOrder.assignedDeliveryBoy.mobile}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 flex items-center gap-2">
                          <MdPending /> Finding nearby partner...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Map or Placeholder */}
                <div className="p-6 sm:p-8 border-b md:border-b-0 lg:border-r border-gray-100 md:col-span-1 lg:col-span-1 min-h-[300px] flex items-center justify-center bg-gray-50 relative overflow-hidden group">
                  {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" ? (
                    <div className="absolute inset-0 w-full h-full">
                      <DeliveryBoyTracking
                        data={{
                          deliveryBoyLocation: liveLocation[shopOrder.assignedDeliveryBoy?._id] || {
                            lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                            lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                          },
                          customerLocation: {
                            lat: currentOrder.deliveryAddress.latitude,
                            lon: currentOrder.deliveryAddress.longitude,
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
                        <MdDeliveryDining size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">
                        {shopOrder.status === 'delivered' ? 'Order Delivered successfully!' : 'Live tracking will start once out for delivery.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items Summary */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MdStorefront /> Order Summary
                  </h3>
                  <div className="space-y-3 mb-6">
                    {shopOrder.shopOrderItems?.map((item, i) => (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-xs text-gray-500 block">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-dashed border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">₹{shopOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                      <span>Total</span>
                      <span>₹{shopOrder.subtotal}</span>
                    </div>
                  </div>

                  {/* Owner Details Toggle */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={toggleItemsShow}
                      className="text-xs font-medium text-gray-500 hover:text-orange-600 flex items-center gap-1 transition-colors"
                    >
                      {userDetailsShow ? 'Hide Owner Details' : 'Show Owner Details'}
                    </button>

                    {userDetailsShow && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm font-bold text-gray-900 mb-1">{shopOrder.owner.fullName}</p>
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          <a href={`tel:${shopOrder.owner.mobile}`} className="flex items-center gap-2 hover:text-blue-600"><IoMdCall /> {shopOrder.owner.mobile}</a>
                          <a href={`mailto:${shopOrder.owner.email}`} className="flex items-center gap-2 hover:text-blue-600"><IoMdMail /> {shopOrder.owner.email}</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrderPage;
