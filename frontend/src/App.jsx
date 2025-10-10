import { Route, Routes, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/Home";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGateMyShop";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemsByCity from "./hooks/useGetItemsByCity";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useUpdateLocation from "./hooks/useUpdateLocation";
import TrackOrderPage from "./pages/TrackOrderPage";
import Shop from "./pages/Shop";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { setSocket, updateRealtimeStatus, addMyOrder } from "./redux/userSlice";
import { serverUrl } from "./config";
import Footer from "./pages/Footer";
import ContactUs from "./pages/Contact";


// serverUrl moved to ./config for deployment

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
      const socketInstance = io(serverUrl,{withCredentials:true})
      dispatch(setSocket(socketInstance))
      socketInstance.on('connect', () => {
        if(userData){
          socketInstance.emit('identity', {userId: userData._id})
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
      const handleStatus = ({orderId, shopId, status}) => {
         dispatch(updateRealtimeStatus({orderId, shopId, status}))
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
  

  return (
    <Routes>
      <Route
        path="/signin"
        element={!userData ? <>  <SignIn /> <Footer/> </>: <Navigate to={"/"} />}
      />
      <Route
        path="/signin/:role"
        element={!userData ? <>  <SignIn /> <Footer/> </>: <Navigate to={"/"} />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />
      <Route
        path="/"
        element={<Home />}
      />
       <Route
        path="/contact"
        element={<ContactUs />}
      />
        <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop/> : <Navigate to={"/signin"} />}
      />
     <Route
        path="/add-items"
        element={userData ? <AddItem/> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/edit-items/:itemId"
        element={userData ? <EditItem/> : <Navigate to={"/signin"} />}
      />
       <Route
        path="/cart"
        element={<CartPage/>}
      />
       <Route
        path="/checkOut"
        element={userData ? <CheckOut/> : <Navigate to={"/signin/user?redirect=/checkOut"} />}
      />
      <Route
        path="/order-placed"
        element={userData ? <OrderPlaced/> : <Navigate to={"/signin"} />}
      />
      <Route
        path="/my-orders"
        element={userData ? <MyOrders/> : <Navigate to={"/signin"} />}
      />
       <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage/> : <Navigate to={"/signin"} />}
      />
       <Route
        path="/shop/:shopId"
        element={<Shop/>}
      />
    </Routes>
  );
}

export default App;
