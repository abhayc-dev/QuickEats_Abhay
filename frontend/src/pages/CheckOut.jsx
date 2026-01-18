//! CheckOut Page

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { ImLocation2 } from "react-icons/im";
import { MdMyLocation } from "react-icons/md";
import { GoSearch } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import { FcMoneyTransfer } from "react-icons/fc";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa6";
import { serverUrl } from "../config";
import { addMyOrder, clearCart } from "../redux/userSlice";
// import { addMyOrder } from "../redux/userSlice";

const CheckOut = () => {
  const apikey = import.meta.env.VITE_GEOAPIKEY;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector(
    (state) => state.user
  );

  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;

  const [addressInput, setAddressInput] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");

  //!  DragEnd to give the lat & lng
  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    // calling the address function
    getAddressByLatLng(lat, lng);
  };

  //! Recenter the map
  function RecenterMap({ location }) {
    if (location.lat && location.lon) {
      const map = useMap();
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
    return null;
  }

  //! Get address by latitude and longitude
  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apikey}`
      );
      dispatch(setAddress(result?.data?.results[0].formatted));
    } catch (error) {
      console.log("getAddressByLatLng", error);
    }
  };

  //! function of get current location after click
  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1];
    const longitude = userData.location.coordinates[0];

    // mapSlice
    dispatch(setLocation({ lat: latitude, lon: longitude }));
    // call address
    getAddressByLatLng(latitude, longitude);
  };

  const [loading, setLoading] = useState(false);

  //! Fetch the API from backend
  const handlePlaceOrder = async () => {
    // Validation
    if (!addressInput) {
      alert("Please enter a delivery address.");
      return;
    }
    if (!location?.lat || !location?.lon) {
      alert("Please set your location on the map.");
      return;
    }

    // Check if Razorpay SDK is needed and loaded
    if (paymentMethod === "online" && !window.Razorpay) {
      console.warn("Razorpay SDK not found, attempting to load...");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      // Wait for script to load (simple poll)
      await new Promise((resolve) => {
        script.onload = resolve;
        setTimeout(resolve, 2000); // Wait 2s max then try anyway (handlers might fail but at least we tried)
      });

      if (!window.Razorpay) {
        alert("Payment system failed to load. Please refresh the page check your internet connection.");
        return;
      }
    }

    // Long Distance Check
    try {
      const geoResult = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${location.lat}&lon=${location.lon}&format=json&apiKey=${apikey}`
      );
      const checkoutCity = geoResult?.data?.results[0]?.city || geoResult?.data?.results[0]?.county || geoResult?.data?.results[0]?.state_district;
      // console.log("Checkout City:", checkoutCity);

      // Check shop cities from cart items
      // Ensure we handle object or ID logic safely.
      // If Shop.jsx injection worked, item.shop is an object with city.
      const distinctShopCities = [...new Set(cartItems.map(item => item?.shop?.city).filter(Boolean))];
      // console.log("Shop Cities:", distinctShopCities);

      if (checkoutCity && distinctShopCities.length > 0) {
        const isFar = distinctShopCities.some(shopCity => shopCity.toLowerCase().trim() !== checkoutCity.toLowerCase().trim());

        if (isFar) {
          alert(
            `Order Restricted: Your delivery location (${checkoutCity}) is too far from the restaurant's location (${distinctShopCities.join(", ")}). Please select a closer delivery address to proceed.`
          );
          return; // Stop execution
        }
      }
    } catch (err) {
      console.warn("Distance check warning:", err);
      // We continue if the API fails, to avoid blocking valid orders due to tech glitches.
      // But if user insists on strictness, we could block here too.
      // For now, assuming the "order ho gaya" was due to missing city data in cart items, which I fixed in Shop.jsx.
    }

    try {
      setLoading(true);
      console.log("Placing order...", {
        paymentMethod,
        address: addressInput,
        total: AmountWithDeliveryFee
      });

      // Added timeout to prevent hanging
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount: AmountWithDeliveryFee,
          cartItems,
        },
        {
          withCredentials: true,
          timeout: 45000 // 45 seconds timeout
        }
      );

      console.log("Order placed response:", result.data);

      //! check condition for payment
      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data));
        dispatch(clearCart());
        navigate("/order-placed");
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        if (orderId && razorOrder) {
          openRazorpayWindow(orderId, razorOrder);
        } else {
          throw new Error("Invalid response from server (missing order details)");
        }
      }
    } catch (error) {
      console.error("Place order failed:", error);
      let msg = "Failed to place order.";
      if (error.code === 'ECONNABORTED') {
        msg = "Request timed out. Please check your internet connection or try again.";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  //! function for open razorPay windows
  const openRazorpayWindow = (orderId, razorOrder) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please check your internet connection.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Quick Eats",
      description: "Food Delivery",
      order_id: razorOrder.id,
      theme: {
        color: "#ff4d2d", // Brand theme color
      },
      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true }
          );
          dispatch(addMyOrder(result.data));
          dispatch(clearCart());
          navigate("/order-placed");
        } catch (error) {
          console.error("Payment Verification Failed:", error);
          alert("Payment Verification Failed");
        }
      },
      prefill: {
        name: userData?.fullName,
        email: userData?.email,
        contact: userData?.mobile,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      alert("Payment Failed: " + response.error.description);
      console.error("Payment Failed:", response.error);
    });
    rzp.open();
  };




  //! useEffect -> rerender when the address change
  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  //! Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  //! function for get lat & long through Address
  const getLatLonByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apikey}`
      );
      const { lat, lon } = result.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen md:h-screen h-screen overflow-y-auto flex justify-center px-4 sm:px-6 lg:px-8 items-start bg-gray-50/50 pt-8 pb-10 lg:pt-2 lg:pb-0">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">

        {/* Left Section - Details */}
        <div className="flex-1 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm transition-all group"
            >
              <IoIosArrowRoundBack size={28} className="text-gray-600 group-hover:text-orange-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Checkout</h1>
          </div>

          {/* Delivery Location Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <ImLocation2 size={16} />
              </span>
              Delivery Location
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-gray-50/50 w-full"
                placeholder="Enter your complete delivery address..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm"
                  onClick={getLatLonByAddress}
                >
                  <GoSearch size={18} />
                  <span className="hidden sm:inline">Search</span>
                </button>
                <button
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm shadow-blue-200"
                  onClick={getCurrentLocation}
                >
                  <MdMyLocation size={18} />
                  <span className="hidden sm:inline">Locate Me</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative">
              <div className="h-72 w-full bg-gray-100">
                {location?.lat && location?.lon ? (
                  <MapContainer
                    className={"w-full h-full z-0"}
                    center={[location.lat, location.lon]}
                    zoom={16}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap location={location} />
                    <Marker
                      position={[location.lat, location.lon]}
                      draggable
                      eventHandlers={{ dragend: onDragEnd }}
                    />
                  </MapContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 bg-gray-50">
                    <p className="text-gray-500 font-medium">Map location unavailable</p>
                    <button
                      onClick={getCurrentLocation}
                      className="text-white bg-orange-600 px-6 py-2.5 rounded-full shadow-lg hover:bg-orange-700 transition font-medium text-sm"
                    >
                      Detect My Location
                    </button>
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 shadow-sm z-[400]">
                Drag marker to adjust
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <FcMoneyTransfer size={16} />
              </span>
              Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 group overflow-hidden ${paymentMethod === "cod"
                  ? "border-orange-500 bg-orange-50/30 shadow-md shadow-orange-100"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                  }`}
                onClick={() => setPaymentMethod("cod")}
              >
                {paymentMethod === "cod" && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">Selected</div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <FcMoneyTransfer size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors">Cash On Delivery</h3>
                    <p className="text-xs text-gray-500">Traditional & Reliable</p>
                  </div>
                </div>
              </div>

              <div
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 group overflow-hidden ${paymentMethod === "online"
                  ? "border-purple-500 bg-purple-50/30 shadow-md shadow-purple-100"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                  }`}
                onClick={() => setPaymentMethod("online")}
              >
                {paymentMethod === "online" && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">Selected</div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 border-2 border-white ring-1 ring-gray-100">
                      <FaMobileScreenButton size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border-2 border-white ring-1 ring-gray-100">
                      <FaCreditCard size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">Online Payment</h3>
                    <p className="text-xs text-gray-500">UPI, Cards & More</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 border border-gray-100 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Overview</h2>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Item Total</span>
                <span className="font-medium">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                  {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200/50">
                <span>To Pay</span>
                <span className="text-2xl tracking-tight">₹{AmountWithDeliveryFee}</span>
              </div>
            </div>

            <button
              className={`w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{paymentMethod === "cod" ? "Place Order" : "Proceed to Pay"}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              By placing an order, you agree to our Terms and Conditions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckOut;
