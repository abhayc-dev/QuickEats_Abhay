//! User DashBoard Card

// bg-gradient-to-br from-orange-50 via-white to-orange-100
import React, { useEffect, useRef, useState } from "react";
import Nav from "../src/pages/Nav";
import { categories } from "../src/category";
import CategoryCard from "./CategoryCard";
import { HiArrowCircleLeft } from "react-icons/hi";
import { HiArrowCircleRight } from "react-icons/hi";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import Footer from "../src/pages/Footer";
import Skeleton from "./Skeleton";

const UserDashboard = () => {
  const { currentCity, shopsInMyCity, itemsInMyCity, searchItems, loadingShops, loadingItems } =
    useSelector((state) => state.user);

  const cateScrollRef = useRef();
  const shopScrollRef = useRef();

  const [showLeftCatButton, setShowLeftCatButton] = useState(false);
  const [showRightCatButton, setShowRightCatButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  const navigate = useNavigate();

  const handleFilterItems = (category) => {
    if (category === "All") {
      setFilteredItems(itemsInMyCity);
    } else {
      const filterItem = itemsInMyCity.filter((i) => i.category === category);
      setFilteredItems(filterItem);
    }
  };

  useEffect(() => {
    setFilteredItems(itemsInMyCity);
  }, [itemsInMyCity]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.clientWidth + element.scrollLeft < element.scrollWidth
      );
    }
  };

  //! for scroll the card
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  //! for button effect
  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCatButton, setShowRightCatButton);
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton
      );

      cateScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCatButton,
          setShowRightCatButton
        );
      });
      shopScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton
        );
      });
    }

    return (
      () =>
        cateScrollRef?.current?.removeEventListener("scroll", () => {
          updateButton(
            cateScrollRef,
            setShowLeftCatButton,
            setShowRightCatButton
          );
        }),
      shopScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton
        );
      })
    );
  }, [shopsInMyCity]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <Nav />

      {/* //! Search Results Section */}
      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col items-start p-6 shadow-lg rounded-2xl mb-4 border border-gray-300 gap-5 bg-red-50 ">
          {/* //! Title */}
          <div className="flex w-full justify-between items-center border-b  border-gray-200 pb-3">
            <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold flex items-center gap-2">
              🔍 Search Results
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchItems.length} item{searchItems.length > 1 ? "s" : ""} found
            </p>
          </div>

          {/* //! Results Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-2">
            {searchItems.map((item) => (
              <div key={item._id}>
                <FoodCard data={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* //! categories */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
          🍴 Inspiration for Your First Order
        </h1>

        <div className="w-full relative">
          {showLeftCatButton && (
            <button
              className="absolute left-0 top-20 m-1 -translate-y-9 md:-translate-y-1/2 z-10 bg-[#ff4d2d] text-white p-1 rounded-full shadow-lg hover:bg-[#e64528]"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <HiArrowCircleLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={cateScrollRef}
          >
            {categories?.map((cate, index) => (
              <CategoryCard
                name={cate.category}
                image={cate.image}
                key={index}
                onClick={() => handleFilterItems(cate.category)}
              />
            ))}
          </div>

          {showRightCatButton && (
            <button
              className="absolute right-0 top-20 m-1 -translate-y-9 md:-translate-y-1/2 z-10 bg-[#ff4d2d] text-white p-1 rounded-full shadow-lg hover:bg-[#e64528]"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <HiArrowCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* //! shop */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
          🏪 Best Shops in <span className="text-[#ff4d2d]">{currentCity}</span>
        </h1>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-20 m-1 -translate-y-1/2 z-10 bg-[#ff4d2d] text-white p-1 rounded-full shadow-lg hover:bg-[#e64528]"
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <HiArrowCircleLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2"
            ref={shopScrollRef}
          >
            {loadingShops ? (
              // Loading Skeletons
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <Skeleton width="150px" height="150px" shape="rect" className="rounded-2xl" />
                  <Skeleton width="100px" height="20px" />
                </div>
              ))
            ) : shopsInMyCity && shopsInMyCity.length > 0 ? (
              shopsInMyCity.map((shop, index) => (
                <CategoryCard
                  name={shop.name}
                  image={shop.image}
                  key={shop._id || index}
                  onClick={() => navigate(`/shop/${shop._id}`)}
                />
              ))
            ) : (
              <p className="text-gray-500">No shops found in {currentCity}</p>
            )}
          </div>

          {showRightShopButton && (
            <button
              className="absolute right-0 top-20 m-1 -translate-y-1/2 z-10 bg-[#ff4c2d] text-white p-1 rounded-full shadow-lg hover:bg-[#e64528]"
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <HiArrowCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* //! Items Card */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[5px]">
        <h1 className="text-gray-900 text-2xl sm:text-3xl font-bold">
          🍕 Handpicked for You
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Our top picks to satisfy your cravings 🔥
        </p>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-5">
          {loadingItems ? (
            // Loading Skeletons for Items
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 border rounded-xl shadow-sm bg-white">
                <Skeleton width="100%" height="180px" className="rounded-lg" />
                <Skeleton width="60%" height="20px" />
                <Skeleton width="40%" height="20px" />
                <div className="flex justify-between mt-2">
                  <Skeleton width="30%" height="30px" />
                  <Skeleton width="30%" height="30px" />
                </div>
              </div>
            ))
          ) : filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((items, index) => (
              <FoodCard data={items} key={index} />
            ))
          ) : (
            <p className="text-gray-500">No items found</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
