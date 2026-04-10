import React from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { Link } from "react-router-dom";
import { HiCheckCircle } from "react-icons/hi";

const PaymentSuccess = () => {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundImage />
      <Navbar />
      <div className="pt-40 px-8 flex flex-col items-center text-center">
        <div className="bg-green-500/20 p-6 rounded-full mb-8 animate-bounce">
          <HiCheckCircle className="text-8xl text-green-500" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          Payment Successful!
        </h1>
        <p className="text-gray-400 text-xl max-w-lg mb-12">
          Thank you for your purchase. Your course has been unlocked and is ready for you to start learning.
        </p>
        <Link
          to="/dashboard"
          className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/10"
        >
          Go to My Courses
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
