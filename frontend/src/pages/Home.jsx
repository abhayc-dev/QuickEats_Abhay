
import { useSelector } from "react-redux";
import UserDashboard from "../../components/UserDashboard";
import SEO from "../components/SEO";
import { Navigate } from "react-router-dom";

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

  // ! Redirect Logic for Partners
  if (userData?.role === "owner") return <Navigate to="/partner/dashboard" />;
  if (userData?.role === "deliveryBoy") return <Navigate to="/delivery/dashboard" />;
  if (userData?.role === "admin") return <Navigate to="/admin/dashboard" />;

  // ! Render User Dashboard (for Guests and Users)
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
};

export default Home;
