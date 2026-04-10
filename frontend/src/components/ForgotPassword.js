import BackgroundImage from "../common/BackgroundImage";
import Navbar from "../common/Navbar";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { forgotPassword, setResetEmail } from "../store/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");

    dispatch(forgotPassword(email))
      .unwrap()
      .then(() => {
        dispatch(setResetEmail(email));
        navigate("/otp");
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <div className="relative min-h-screen bg-mesh py-32 px-4 lg:px-28 flex items-center justify-center">
      <BackgroundImage />
      <Navbar />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass p-10 rounded-[2.5rem] flex flex-col gap-8">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-black font-outfit text-glow uppercase tracking-tight">Recover Account</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Enter your email address and we'll send you a 6-digit code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
              {loading ? "Sending Code..." : "Send Reset Code"}
            </button>
          </form>

          <button 
            onClick={() => navigate("/login")}
            className="text-center text-neutral-400 text-sm hover:text-white transition-colors font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
