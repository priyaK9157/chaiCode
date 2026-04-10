import React from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { Link } from "react-router-dom";
import { HiXCircle } from "react-icons/hi";

const PaymentCancel = () => {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundImage />
      <Navbar />
      <div className="pt-40 px-8 flex flex-col items-center text-center">
        <div className="bg-red-500/20 p-6 rounded-full mb-8 animate-pulse">
          <HiXCircle className="text-8xl text-red-500" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-rose-600 bg-clip-text text-transparent">
          Payment Cancelled
        </h1>
        <p className="text-gray-400 text-xl max-w-lg mb-12">
          Your payment was not completed. Don't worry, you can try again anytime or explore other courses!
        </p>
        <Link
          to="/"
          className="bg-white/10 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all border border-white/10"
        >
          Return to Course Catalog
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
