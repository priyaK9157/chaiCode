import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById } from "../store/courseSlice";
import Navbar from "../common/Navbar";
import BackgroundImage from "../common/BackgroundImage";
import { HiCreditCard, HiCalendar, HiLockClosed, HiUser, HiArrowLeft } from "react-icons/hi";

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const { selectedCourse: courseData, loading, error } = useSelector((state) => state.courses);

  // Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [payStep, setPayStep] = useState(0); // 0: Idle, 1: Contacting bank, 2: Verifying funds, 3: Completing enrollment

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }
  }, [courseId, dispatch, token, navigate]);

  // Format card number with spaces (1234 5678 ...)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formattedValue);
  };

  // Format expiry date as MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setExpiry(value);
  };

  // CVV max 4 digits
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    setCvv(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPaying) return;

    setIsPaying(true);
    setPayStep(1);

    // Simulate premium payment steps
    setTimeout(() => {
      setPayStep(2);
      setTimeout(() => {
        setPayStep(3);
        setTimeout(() => {
          // Redirect to success page with mock session ID
          navigate(`/payment/success?session_id=mock_${courseId}`);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <BackgroundImage />
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center gap-4">
        <BackgroundImage />
        <h2 className="text-2xl font-bold text-red-500">Error Loading Course</h2>
        <p className="text-gray-400">{error || "Course details could not be found."}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white pb-20">
      <BackgroundImage />
      <Navbar />

      <div className="pt-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 group"
        >
          <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Order Summary Column (Left) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800">
                Order Summary
              </h2>

              <div className="flex gap-4 items-start mb-6">
                {courseData.thumbnailUrl ? (
                  <img
                    src={courseData.thumbnailUrl}
                    alt={courseData.title}
                    className="w-24 h-16 object-cover rounded-lg border border-neutral-800"
                  />
                ) : (
                  <div className="w-24 h-16 bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-neutral-500 border border-neutral-700">
                    No Thumbnail
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white text-base md:text-lg leading-snug">
                    {courseData.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {courseData.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-neutral-400">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="text-white">₹{courseData.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discounts</span>
                  <span className="text-green-500">-₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-white">Free</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-800 text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-orange-500">₹{courseData.price?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/60 rounded-2xl p-6 text-sm text-neutral-400">
              <h4 className="text-white font-bold mb-3">You will instantly unlock:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Immediate access to all lessons</li>
                <li>Lifetime updates and resource materials</li>
                <li>Direct community support & discussions</li>
                <li>Official completion certificate</li>
              </ul>
            </div>
          </div>

          {/* Payment Details Column (Right) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Interactive Credit Card Preview */}
            <div className="relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-orange-950 p-6 shadow-2xl overflow-hidden border border-white/10 flex flex-col justify-between">
              {/* Card Chip & Network Logo */}
              <div className="flex justify-between items-start">
                <div className="w-12 h-9 bg-amber-400/80 rounded-md border border-amber-300/40 relative overflow-hidden shadow-inner">
                  <div className="absolute inset-y-0 left-1/3 w-0.5 bg-neutral-950/20"></div>
                  <div className="absolute inset-y-0 right-1/3 w-0.5 bg-neutral-950/20"></div>
                  <div className="absolute inset-x-0 top-1/3 h-0.5 bg-neutral-950/20"></div>
                  <div className="absolute inset-x-0 bottom-1/3 h-0.5 bg-neutral-950/20"></div>
                </div>
                <div className="text-lg font-bold italic text-neutral-400 tracking-wider">
                  MOCK CARD
                </div>
              </div>

              {/* Card Number */}
              <div className="text-xl md:text-2xl tracking-[0.2em] font-mono font-medium text-white/90 drop-shadow-md py-4">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>

              {/* Cardholder name & Expiry */}
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-0.5 max-w-[70%]">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                    Card Holder
                  </span>
                  <span className="text-sm tracking-wide font-medium truncate uppercase">
                    {cardName || "YOUR NAME"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                    Expires
                  </span>
                  <span className="text-sm tracking-wider font-medium font-mono">
                    {expiry || "MM/YY"}
                  </span>
                </div>
              </div>

              {/* Decorative backgrounds */}
              <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-orange-600/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -left-16 -bottom-16 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>
            </div>

            {/* Payment Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
            >
              {/* Notification Banner */}
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-200/90 rounded-xl px-4 py-3 text-xs flex gap-2.5 items-start">
                <HiLockClosed className="text-lg text-orange-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Mock payment gateway active.</strong> You can input any arbitrary test details (no real credit cards needed). Click "Pay & Enroll" to unlock your course immediately.
                </p>
              </div>

              {/* Cardholder Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                  <HiUser className="text-base text-neutral-500" /> Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-white placeholder-neutral-600 transition-all outline-none"
                  required
                />
              </div>

              {/* Card Number */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                  <HiCreditCard className="text-base text-neutral-500" /> Card Number
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="bg-neutral-950 border border-neutral-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-white placeholder-neutral-600 transition-all outline-none font-mono tracking-widest"
                  required
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                    <HiCalendar className="text-base text-neutral-500" /> Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="bg-neutral-950 border border-neutral-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-white placeholder-neutral-600 transition-all outline-none text-center font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                    <HiLockClosed className="text-base text-neutral-500" /> CVV
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="bg-neutral-950 border border-neutral-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-white placeholder-neutral-600 transition-all outline-none text-center font-mono"
                    required
                  />
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isPaying}
                className="mt-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all py-4 rounded-xl text-black font-bold text-base shadow-lg shadow-orange-950/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPaying ? "Processing..." : `Pay & Enroll (₹${courseData.price?.toLocaleString()})`}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Loading Modal Overlay */}
      {isPaying && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-neutral-900 border border-neutral-800 max-w-md w-full rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl animate-fade-in">
            {/* Spinning gradient loader */}
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-amber-500 animate-spin"></div>
            </div>

            <h3 className="text-2xl font-bold mb-3">
              {payStep === 1 && "Authorizing payment..."}
              {payStep === 2 && "Verifying with mock gateway..."}
              {payStep === 3 && "Completing enrollment..."}
            </h3>

            <p className="text-neutral-400 text-sm">
              {payStep === 1 && "Connecting securely to sandbox processor."}
              {payStep === 2 && "Validation bypassed. Accepting credentials."}
              {payStep === 3 && "Unlocking course and registering your details."}
            </p>

            <div className="flex gap-1.5 mt-6">
              <span className={`w-2.5 h-2.5 rounded-full ${payStep >= 1 ? 'bg-orange-500' : 'bg-neutral-700'} transition-colors duration-300`}></span>
              <span className={`w-2.5 h-2.5 rounded-full ${payStep >= 2 ? 'bg-orange-500' : 'bg-neutral-700'} transition-colors duration-300`}></span>
              <span className={`w-2.5 h-2.5 rounded-full ${payStep >= 3 ? 'bg-orange-500' : 'bg-neutral-700'} transition-colors duration-300`}></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
