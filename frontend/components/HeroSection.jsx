import React from "react";
import heroImage from "../src/assets/hero_3d_burger.png";
import { HiArrowRight } from "react-icons/hi";

const HeroSection = () => {
    return (
        <div className="w-full relative bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl overflow-hidden shadow-2xl mb-10 mt-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">

                {/* Text Content */}
                <div className="z-10 md:w-1/2 text-white space-y-6 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg animate-fade-in-up animation-delay-100">
                        Delicious Food, <br />
                        <span className="text-yellow-200">Delivered Fast.</span>
                    </h1>
                    <p className="text-lg md:text-xl font-medium opacity-90 max-w-lg mx-auto md:mx-0 animate-fade-in-up animation-delay-200">
                        Experience the taste of premium meals delivered hot and fresh to your doorstep within minutes.
                    </p>
                    <div className="animate-fade-in-up animation-delay-300">
                        <button
                            onClick={() => document.getElementById('best-shops')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-yellow-100 transition duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto md:mx-0 cursor-pointer"
                        >
                            Order Now <HiArrowRight />
                        </button>
                    </div>
                </div>

                {/* 3D Image */}
                <div className="md:w-1/2 flex justify-center relative z-10">
                    <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] animate-float transition-transform duration-500 hover:rotate-2">
                        {/* Circular mask to hide text artifacts */}
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                            <img
                                src={heroImage}
                                alt="Delicious 3D Burger"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Decorative Elements (Floating badges) - Repositioned */}
                        <div className="absolute top-4 right-4 bg-white text-orange-600 px-4 py-2 rounded-xl shadow-lg font-bold transform rotate-6 animate-pulse hidden md:block">
                            🔥 Hot
                        </div>
                        <div className="absolute bottom-10 left-0 bg-yellow-400 text-red-700 px-4 py-2 rounded-full shadow-lg font-bold transform -rotate-6 animate-bounce hidden md:block">
                            ⚡ Fast
                        </div>
                    </div>
                </div>

                {/* Background Decorative Circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
        </div>
    );
};

export default HeroSection;
