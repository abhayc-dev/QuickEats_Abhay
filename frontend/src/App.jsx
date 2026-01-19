import { Route, Routes, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, Suspense, lazy } from "react";
import { io } from "socket.io-client";
import { setSocket, updateRealtimeStatus, addMyOrder, updateShopStatus } from "./redux/userSlice";
import { serverUrl } from "./config";
import { Toaster, toast } from 'react-hot-toast';
import axios from "axios";

// 🌍 Global Axios Interceptor for Token Auth (Fallback)
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Initial Hooks
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGateMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";

import Footer from "./pages/Footer";
import { ScaleLoader } from "react-spinners";

// Lazy Load Pages
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Home = lazy(() => import("./pages/Home"));
const CreateEditShop = lazy(() => import("./pages/CreateEditShop"));
const AddItem = lazy(() => import("./pages/AddItem"));
const EditItem = lazy(() => import("./pages/EditItem"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckOut = lazy(() => import("./pages/CheckOut"));
const OrderPlaced = lazy(() => import("./pages/OrderPlaced"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage"));
const Shop = lazy(() => import("./pages/Shop"));
const ContactUs = lazy(() => import("./pages/Contact"));

// Lazy Load Dashboards
const OwnerDashboard = lazy(() => import("../components/OwnerDashboard"));
const DeliveryBoy = lazy(() => import("../components/DeliveryBoy"));
const AdminDashboard = lazy(() => import("../components/AdminDashboard"));

// Loading Fallback Component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <ScaleLoader color="#ea580c" />
  </div>
);

// 🔊 Web Audio API Context (Singleton)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = new AudioContext();

function App() {
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useUpdateLocation();
  useGetCurrentUser();
  useGetMyShop();
  useGetCity();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  useEffect(() => {
    //  Mobile Audio Unlock: Resume AudioContext on first interaction
    const unlockAudio = () => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          console.log("AudioContext Resumed/Unlocked 🔓");
          // Play a silent tiny beep to verify
          playNotificationSound(0);
        });
      }
      // Remove listeners
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('touchend', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('touchend', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    const socketInstance = io(serverUrl, { withCredentials: true })
    dispatch(setSocket(socketInstance))
    socketInstance.on('connect', () => {
      console.log("Socket Connected:", socketInstance.id);
      if (userData) {
        console.log("Emitting Identity for:", userData._id);
        socketInstance.emit('identity', { userId: userData._id })
      }
    })

    // owner: receive new order
    socketInstance.on('newOrder', (payload) => {
      console.log("New Order Incoming!", payload);
      if (userData?.role === 'owner') {
        console.log("User is Owner, dispatching...");
        dispatch(addMyOrder(payload))

        // 🔔 Play Web Audio Sound (Robust)
        playNotificationSound();

        // 🍞 Show Custom Toast
        toast((t) => (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span className="font-bold text-gray-900">New Order Received!</span>
            </div>
            <div className="text-sm text-gray-600">
              {payload.shopOrders.shopOrderItems.map(i => i.name).join(", ")}
            </div>
            <p className="text-xs font-bold text-orange-600 mt-1">
              Total: ₹{payload.shopOrders.subtotal}
            </p>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/partner/orders');
              }}
              className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg mt-2 self-start hover:bg-orange-600 transition-colors"
            >
              View Order
            </button>
          </div>
        ), {
          duration: 5000,
          position: 'top-right',
          style: {
            border: '1px solid #fed7aa',
            padding: '16px',
            color: '#713200',
            background: '#fff7ed',
            borderRadius: '16px'
          },
        });
      }
    })

    // delivery boy: receive new assignment
    socketInstance.on('newAssignment', (payload) => {
      console.log("New Assignment Incoming!", payload);
      if (userData?.role === 'deliveryBoy' && payload.sendTo === userData._id) {

        // 🔔 Play Sound
        playNotificationSound();

        // 🍞 Show Custom Toast
        toast((t) => (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛵</span>
              <span className="font-bold text-gray-900">New Delivery Request!</span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-bold">{payload.shopName}</span> wants you to deliver an order.
            </div>
            <div className="text-xs text-gray-500 line-clamp-1">
              📍 {payload.deliveryAddress?.text}
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/delivery/dashboard');
              }}
              className="bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg mt-2 self-start hover:bg-orange-700 transition-colors shadow-sm"
            >
              View & Accept
            </button>
          </div>
        ), {
          duration: 8000, // Longer duration for drivers
          position: 'top-center', // Center for attention
          style: {
            border: '1px solid #fdba74',
            padding: '16px',
            color: '#c2410c',
            background: '#fff7ed',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          },
        });
      }
    });

    // user + owner: status updates and delivered event
    const handleStatus = ({ orderId, shopId, status }) => {
      dispatch(updateRealtimeStatus({ orderId, shopId, status }))
    }
    socketInstance.on('update-status', handleStatus)
    socketInstance.on('orderDelivered', handleStatus)

    socketInstance.on("shopStatusUpdate", ({ shopId, isOpen }) => {
      dispatch(updateShopStatus({ shopId, isOpen }));
    });

    return () => {
      socketInstance.off('newOrder')
      socketInstance.off('update-status', handleStatus)
      socketInstance.off('orderDelivered', handleStatus)
      socketInstance.off("shopStatusUpdate");
      socketInstance.disconnect()

      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    }
  }, [userData?._id])

  // ! Helper for Private Routes
  const PrivateRoute = ({ children, role, redirectLink }) => {
    if (!userData) return <Navigate to={redirectLink || "/signin"} />;
    if (userData.role !== role) {
      // Smart Redirect based on actual role
      if (userData.role === 'owner') return <Navigate to="/partner/dashboard" />;
      if (userData.role === 'deliveryBoy') return <Navigate to="/delivery/dashboard" />;
      if (userData.role === 'admin') return <Navigate to="/admin/dashboard" />;
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Suspense fallback={<Loader />}>
      <Toaster />
      <Routes>
        {/* ================= USER PORTAL (Root) ================= */}

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop/:shopId" element={<Shop />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User Auth */}
        <Route path="/signin" element={!userData ? <><SignIn forcedRole="user" /> <Footer /> </> : <Navigate to="/" />} />
        <Route path="/signup" element={!userData ? <SignUp forcedRole="user" /> : <Navigate to="/" />} />

        {/* User Private Routes */}
        <Route path="/checkOut" element={userData ? <CheckOut /> : <Navigate to="/signin?redirect=/checkOut" />} />
        <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
        <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
        <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />} />

        {/* ================= PARTNER PORTAL ================= */}
        <Route path="/partner">
          {/* Auth */}
          <Route path="login" element={!userData ? <><SignIn forcedRole="owner" /> <Footer /></> : <Navigate to="/partner/dashboard" />} />
          <Route path="join" element={!userData ? <SignUp forcedRole="owner" /> : <Navigate to="/partner/dashboard" />} />

          {/* Protected */}
          <Route path="dashboard" element={<PrivateRoute role="owner" redirectLink="/partner/login"><OwnerDashboard /></PrivateRoute>} />
          <Route path="orders" element={<PrivateRoute role="owner" redirectLink="/partner/login"><MyOrders /></PrivateRoute>} />
          <Route path="create-edit-shop" element={<PrivateRoute role="owner" redirectLink="/partner/login"><CreateEditShop /></PrivateRoute>} />
          <Route path="add-items" element={<PrivateRoute role="owner" redirectLink="/partner/login"><AddItem /></PrivateRoute>} />
          <Route path="edit-items/:itemId" element={<PrivateRoute role="owner" redirectLink="/partner/login"><EditItem /></PrivateRoute>} />
        </Route>

        {/* ================= DELIVERY PORTAL ================= */}
        <Route path="/delivery">
          {/* Auth */}
          <Route path="login" element={!userData ? <><SignIn forcedRole="deliveryBoy" /> <Footer /></> : <Navigate to="/delivery/dashboard" />} />
          <Route path="join" element={!userData ? <SignUp forcedRole="deliveryBoy" /> : <Navigate to="/delivery/dashboard" />} />

          {/* Protected */}
          <Route path="dashboard" element={<PrivateRoute role="deliveryBoy" redirectLink="/delivery/login"><DeliveryBoy /></PrivateRoute>} />
        </Route>

        {/* ================= ADMIN PORTAL ================= */}
        <Route path="/admin">
          {/* Auth */}
          <Route path="login" element={!userData ? <><SignIn forcedRole="admin" /> <Footer /></> : <Navigate to="/admin/dashboard" />} />

          {/* Protected */}
          <Route path="dashboard" element={<PrivateRoute role="admin" redirectLink="/admin/login"><AdminDashboard /></PrivateRoute>} />
        </Route>

        {/* Fallback for old routes or 404 - Redirect to Home which handles logic */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Suspense>
  );
}

// 🔊 Sound Generator Utility: "Ding-Dong" Chime
// 🔊 Sound Generator Utility: "Ding-Dong" Chime
async function playNotificationSound(vol = 1) {
  try {
    // Re-init if closed or missing
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext();
    }

    // Resume if suspended (Critical for browsers)
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Helper to play one note
    const playNote = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth Attack (Fade in)
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * 0.5, startTime + 0.05);

      // Smooth Decay (Fade out)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Note 1: "Ding" (Higher pitch, E5 approx 659Hz)
    playNote(660, now, 0.6);

    // Note 2: "Dong" (Lower pitch, C5 approx 523Hz)
    playNote(523, now + 0.4, 0.8);

  } catch (error) {
    console.error("Audio Playback Error:", error);
  }
}

export default App;
