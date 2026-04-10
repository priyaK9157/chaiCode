import BackgroundImage from "../common/BackgroundImage";
import Navbar from "../common/Navbar";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOtp, clearError } from "../store/authSlice";

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, resetEmail } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!resetEmail) {
      navigate("/forgot-password");
    }
    return () => dispatch(clearError());
  }, [resetEmail, navigate, dispatch]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Please enter complete OTP");
      return;
    }

    dispatch(verifyOtp({ email: resetEmail, otp: finalOtp }))
      .unwrap()
      .then(() => {
        navigate("/reset-password");
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <div className="relative min-h-screen bg-mesh py-32 px-4 flex items-center justify-center">
      <BackgroundImage />
      <Navbar />

      <div className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="glass p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-glow"
        >
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-black font-outfit text-glow uppercase tracking-tight">Verify Identity</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              We've sent a 6-digit code to <span className="text-white font-semibold">{resetEmail}</span>.
            </p>
          </div>

          <div className="flex justify-between gap-3 mt-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl glass border-white/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all text-white outline-none"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 mt-2"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <p className="text-center text-neutral-400 text-sm mt-2">
            Didn’t receive code?{" "}
            <span 
              onClick={() => navigate("/forgot-password")}
              className="text-orange-400 cursor-pointer hover:underline font-semibold"
            >
              Resend OTP
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Otp;
