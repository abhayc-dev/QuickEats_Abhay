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

  //! Fetch the API from backend
  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount:AmountWithDeliveryFee,
          cartItems,
        },
        { withCredentials: true }
      );

      //! check condition for payment
      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data));
        dispatch(clearCart());
        navigate("/order-placed");
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //! function for open razorPay windows
  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Vicky Sweet's Shop",
      description: "Food Delivery Website",
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
          console.log(error);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };




  //! useEffect -> rerender when the address change
  useEffect(() => {
    setAddressInput(address);
  }, [address]);

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
    <div className="min-h-screen flex justify-center p-6 items-center bg-[#FAF9F6]">
      <div
        className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => {
          navigate("/");
        }}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>

      {/* //! checkout-div */}
      <div className="w-full max-w-[900px] bg-gray-100 rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-700"> CheckOut</h1>

        {/* //! mapSection */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-700">
            <ImLocation2 className="text-[#ff4d2d]" /> Delivery Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter Your Delivery Address.."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={getLatLonByAddress}
            >
              <GoSearch size={17} />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={getCurrentLocation}
            >
              <MdMyLocation />
            </button>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat, location?.lon]}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker
                  position={[location?.lat, location?.lon]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              </MapContainer>
            </div>
          </div>
        </section>

        {/* //! payment-Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "cod"
                  ? "border-[#f24c4cb9] shadow bg-[#FAF9F6]"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <FcMoneyTransfer size={20} />
              </span>
              <div>
                <p className="font-medium text-gray-700">Cash On Delivery</p>
                <p className="text-xs text-gray-500">
                  Pay in cash when your food arrives.
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "online"
                  ? "border-[#f24c4cb9] shadow bg-[#FAF9F6]"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FaMobileScreenButton size={20} className="text-purple-500" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FaCreditCard size={20} className="text-blue-600" />
              </span>
              <div>
                <p className="font-medium text-gray-700">
                  Credit Card / Debit Card / UPI
                </p>
                <p className="text-xs text-gray-500">
                  Pay securely online before delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* //! Order Summery */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            {" "}
            Order Summary
          </h2>
          <div className="rounded-xl border bg-gray-200 p-4 space-y-2">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <hr className="border-gray-300 my-2" />

            <div className="flex justify-between font-medium text-gray-700">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{deliveryFee == 0 ? "Free" : deliveryFee}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
              <span>Total</span>
              <span>₹{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        {/* //! Order Summery */}
        <button
          className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold"
          onClick={handlePlaceOrder}
        >
          {paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CheckOut;
