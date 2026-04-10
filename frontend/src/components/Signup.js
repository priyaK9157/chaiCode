import BackgroundImage from "../common/BackgroundImage";
import Navbar from "../common/Navbar";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser, verifySignupOtp } from "../store/authSlice";

const Signup = () => {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT", 
    });

    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);
    const [formError, setFormError] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
        setFormError("");
    };

    const validateForm = () => {
        if (!userData.name || !userData.email || !userData.password) {
            return "All fields are required";
        }
        if (userData.password.length < 6) {
            return "Password must be at least 6 characters";
        }
        if (!["STUDENT", "INSTRUCTOR"].includes(userData.role)) {
            return "Invalid role selected";
        }
        return "";
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            await dispatch(registerUser(userData)).unwrap();
            // Show OTP screen instead of redirecting
            setShowOtp(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            setFormError("Please enter the OTP");
            return;
        }

        try {
            const res = await dispatch(verifySignupOtp({ email: userData.email, otp })).unwrap();
            if (res.user?.role === "INSTRUCTOR") {
                navigate("/instructor");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative min-h-screen bg-mesh py-32 px-4 flex items-center justify-center">
            <BackgroundImage />
            <Navbar />

            <div className="relative z-10 w-full max-w-lg">
                {!showOtp ? (
                    <form
                        onSubmit={handleSignup}
                        className="glass p-10 lg:p-14 rounded-[3rem] flex flex-col gap-8 shadow-glow"
                    >
                        <div className="text-center flex flex-col gap-3">
                            <h2 className="text-4xl font-black font-outfit text-glow uppercase tracking-tight">
                                Create Account
                            </h2>
                            <p className="text-neutral-400 text-sm font-light">
                                Join the elite community of developers.
                            </p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={userData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="input-field"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    placeholder="name@domain.com"
                                    className="input-field"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={userData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input-field"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
                                    Select Role
                                </label>

                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="STUDENT"
                                            checked={userData.role === "STUDENT"}
                                            onChange={handleChange}
                                        />
                                        <span className="text-sm text-white">Student</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="INSTRUCTOR"
                                            checked={userData.role === "INSTRUCTOR"}
                                            onChange={handleChange}
                                        />
                                        <span className="text-sm text-white">Instructor</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {formError && (
                            <p className="text-red-500 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-lg">
                                {formError}
                            </p>
                        )}

                        {error && (
                            <p className="text-red-500 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 mt-2"
                        >
                            {loading ? "Creating Account..." : "Join Now"}
                        </button>

                        <p className="text-center text-neutral-400 text-sm mt-2">
                            Already a member?{" "}
                            <span
                                className="text-white font-bold cursor-pointer hover:text-orange-400 transition-colors"
                                onClick={() => navigate("/login")}
                            >
                                Log In
                            </span>
                        </p>
                    </form>
                ) : (
                    <form
                        onSubmit={handleVerifyOtp}
                        className="glass p-10 lg:p-14 rounded-[3rem] flex flex-col gap-8 shadow-glow"
                    >
                        <div className="text-center flex flex-col gap-3">
                            <h2 className="text-4xl font-black font-outfit text-glow uppercase tracking-tight">
                                Verify Email
                            </h2>
                            <p className="text-neutral-400 text-sm font-light">
                                We've sent a 6-digit OTP to {userData.email}
                            </p>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">
                                    OTP Code
                                </label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value);
                                        setFormError("");
                                    }}
                                    placeholder="123456"
                                    className="input-field text-center tracking-[0.5em] text-2xl font-bold"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        {formError && (
                            <p className="text-red-500 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-lg">
                                {formError}
                            </p>
                        )}

                        {error && (
                            <p className="text-red-500 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 mt-2"
                        >
                            {loading ? "Verifying..." : "Verify & Start"}
                        </button>

                        <p className="text-center text-neutral-400 text-sm mt-2">
                            Didn't receive the OTP?{" "}
                            <span
                                className="text-white font-bold cursor-pointer hover:text-orange-400 transition-colors"
                                onClick={async () => {
                                    try {
                                        const res = await fetch("http://localhost:5000/api/auth/resend-signup-otp", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ email: userData.email }),
                                        });
                                        const data = await res.json();
                                        alert(data.message || "OTP resent!");
                                    } catch {
                                        alert("Failed to resend OTP");
                                    }
                                }}
                            >
                                Resend OTP
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;