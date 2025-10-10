//! This is a Home Page ByDefault Show the UserDashBoard

import { useSelector } from "react-redux";
import UserDashboard from "../../components/UserDashboard";
import OwnerDashboard from "../../components/OwnerDashboard";
import DeliveryBoy from "../../components/DeliveryBoy";

const Home = () => {
  const userData = useSelector((state) => state.user.userData);
  
  if (!userData) {
    return (
      <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#FAF9F6]">
        <UserDashboard />
      </div>
    );
  }
  
  return (
    <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#FAF9F6]">
      {userData?.role == "user" && <UserDashboard />}
      {userData?.role == "owner" && <OwnerDashboard />}
      {userData?.role == "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
};

export default Home;
