import React, { useEffect, useState } from "react";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { Link, useSearchParams } from "react-router-dom";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../config";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const token = useSelector((state) => state.auth.token);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("Missing payment session identifier.");
        setVerifying(false);
        return;
      }

      if (!token) {
        setError("User authentication required to verify payment.");
        setVerifying(false);
        return;
      }

      try {
        console.log("📡 Sending confirm-payment request for session:", sessionId);
        const response = await fetch(`${API_BASE_URL}/api/payments/confirm-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          console.log("✅ Payment verified successfully!");
        } else {
          setError(data.message || "Failed to verify checkout session.");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("Network error occurred during payment verification.");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, token]);

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundImage />
      <Navbar />
      <div className="pt-40 px-6 md:px-12 flex flex-col items-center text-center max-w-4xl mx-auto">
        {verifying ? (
          <div className="flex flex-col items-center gap-6 mt-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
            <h1 className="text-3xl font-bold text-neutral-300">Verifying Payment...</h1>
            <p className="text-gray-400">Please wait while we confirm your payment details with Stripe.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center mt-10">
            <div className="bg-red-500/20 p-6 rounded-full mb-8 animate-pulse">
              <HiXCircle className="text-8xl text-red-500" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-rose-600 bg-clip-text text-transparent">
              Verification Failed
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mb-12">
              {error}
            </p>
            <Link
              to="/"
              className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/10"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-10">
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
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
