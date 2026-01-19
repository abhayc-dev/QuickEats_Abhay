import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, Suspense, lazy } from "react";
import { io } from "socket.io-client";
import { setSocket, updateRealtimeStatus, addMyOrder } from "./redux/userSlice";
import { serverUrl } from "./config";

// Initial Hooks (Keep static)
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGateMyShop";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";

// Helper Components
import Footer from "./pages/Footer";
import { ScaleLoader } from "react-spinners"; // Assuming you have spinners or use a simple div

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

function App() {
  const userData = useSelector((state) => state.user.userData);
  const dispatch = useDispatch();

  useUpdateLocation();
  useGetCurrentUser();
  useGetMyShop();
  useGetCity();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true })
    dispatch(setSocket(socketInstance))
    socketInstance.on('connect', () => {
      if (userData) {
        socketInstance.emit('identity', { userId: userData._id })
      }
    })

    // owner: receive new order
    socketInstance.on('newOrder', (payload) => {
      // for owner dashboard, rely on useGetMyOrders to reflect; also add to store if owner is logged in
      if (userData?.role === 'owner') {
        dispatch(addMyOrder(payload))
      }
    })

    // user + owner: status updates and delivered event
    const handleStatus = ({ orderId, shopId, status }) => {
      dispatch(updateRealtimeStatus({ orderId, shopId, status }))
    }
    socketInstance.on('update-status', handleStatus)
    socketInstance.on('orderDelivered', handleStatus)
    return () => {
      socketInstance.off('newOrder')
      socketInstance.off('update-status', handleStatus)
      socketInstance.off('orderDelivered', handleStatus)
      socketInstance.disconnect()
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

export default App;
