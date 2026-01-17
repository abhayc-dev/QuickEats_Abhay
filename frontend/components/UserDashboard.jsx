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

import HeroSection from "./HeroSection";

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
    <div className="w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <Nav />
      {/* Hero Section */}
      <div className="w-full max-w-6xl px-2">
        <HeroSection />
      </div>

      {/* //! Search Results Section */}
      {/* //! Search Results Section */}
      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col items-start p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl mb-8 border border-gray-100 gap-6 bg-white relative overflow-hidden">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500" />

          {/* //! Title */}
          <div className="flex w-full justify-between items-end border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <div>
                <h1 className="text-gray-900 text-xl sm:text-2xl font-black tracking-tight">
                  Search <span className="text-orange-600">Results</span>
                </h1>
                <p className="text-gray-400 text-xs font-medium mt-0.5">
                  Top matches for your craving
                </p>
              </div>
            </div>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {searchItems.length} Found
            </span>
          </div>

          {/* //! Results Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchItems.map((item) => (
              <div key={item._id} className="transform hover:-translate-y-1 transition-transform duration-300">
                <FoodCard data={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* //! categories */}
      <div className="w-full max-w-6xl flex flex-col gap-6 items-start p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm text-center pt-1">🍴</span>
          <h1 className="text-gray-900 text-2xl sm:text-3xl font-black tracking-tight relative">
            Inspiration for Your <span className="text-orange-600">First Order</span>
            <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-orange-400 to-transparent rounded-full"></span>
          </h1>
        </div>

        <div className="w-full relative">
          {showLeftCatButton && (
            <button
              className="absolute left-0 top-20 m-1 -translate-y-9 md:-translate-y-1/2 z-10 bg-primary text-primary-foreground p-1 rounded-full shadow-lg hover:brightness-110"
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
              className="absolute right-0 top-20 m-1 -translate-y-9 md:-translate-y-1/2 z-10 bg-primary text-primary-foreground p-1 rounded-full shadow-lg hover:brightness-110"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <HiArrowCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* //! shop */}
      <div id="best-shops" className="w-full max-w-6xl flex flex-col gap-6 items-start p-4 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="text-3xl flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm text-center pt-1">🏪</span>
          <h1 className="text-gray-900 text-2xl sm:text-3xl font-black tracking-tight">
            Best Shops in <span className="text-orange-600 underline decoration-yellow-400 decoration-wavy decoration-2 underline-offset-4">{currentCity}</span>
          </h1>
        </div>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-20 m-1 -translate-y-1/2 z-10 bg-primary text-primary-foreground p-1 rounded-full shadow-lg hover:brightness-110"
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
              className="absolute right-0 top-20 m-1 -translate-y-1/2 z-10 bg-primary text-primary-foreground p-1 rounded-full shadow-lg hover:brightness-110"
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <HiArrowCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* //! Items Card */}
      <div className="w-full max-w-6xl flex flex-col gap-6 items-start p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm text-center pt-1">🍕</span>
            <h1 className="text-gray-900 text-2xl sm:text-3xl font-black tracking-tight">
              Handpicked for <span className="text-orange-600">You</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium ml-16 mt-[-5px]">
            Our top picks to satisfy your cravings 🔥
          </p>
        </div>
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
