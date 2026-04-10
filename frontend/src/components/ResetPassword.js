import BackgroundImage from "../common/BackgroundImage";
import Navbar from "../common/Navbar";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetPassword, clearError } from "../store/authSlice";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, resetEmail } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!resetEmail) {
      navigate("/forgot-password");
    }
    return () => dispatch(clearError());
  }, [resetEmail, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("Passwords do not match");
    }

    dispatch(resetPassword({ email: resetEmail, newPassword: formData.newPassword }))
      .unwrap()
      .then(() => {
        alert("Password reset successful! Please login.");
        navigate("/login");
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
          className="glass p-10 rounded-[2.5rem] flex flex-col gap-8"
        >
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-black font-outfit text-glow uppercase tracking-tight">New Password</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Create a strong new password for your account.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 mt-2"
          >
            {loading ? "Updating..." : "Access Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
