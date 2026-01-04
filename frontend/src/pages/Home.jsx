//! This is a Home Page ByDefault Show the UserDashBoard

import { useSelector } from "react-redux";
import UserDashboard from "../../components/UserDashboard";
import OwnerDashboard from "../../components/OwnerDashboard";
import DeliveryBoy from "../../components/DeliveryBoy";
import SEO from "../components/SEO";

const Home = () => {
  const userData = useSelector((state) => state.user.userData);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Quick Eats",
    "url": "https://quickeats-abhay.onrender.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://quickeats-abhay.onrender.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  if (!userData) {
    return (
      <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#FAF9F6]">
        <SEO
          title="Quick Eats | Home"
          description="Order food online from the best restaurants."
          structuredData={structuredData}
        />
        <UserDashboard />
      </div>
    );
  }

  return (
    <div className="w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#FAF9F6]">
      <SEO title="Quick Eats | Dashboard" description="Manage your orders and account." />
      {userData?.role == "user" && <UserDashboard />}
      {userData?.role == "owner" && <OwnerDashboard />}
      {userData?.role == "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
};

export default Home;
