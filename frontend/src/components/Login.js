import BackgroundImage from "../common/BackgroundImage";
import Navbar from "../common/Navbar";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../store/authSlice";

const Login = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser(credentials))
            .unwrap()
            .then((res) => {
                if (res.user?.role === "INSTRUCTOR") {
                    navigate("/instructor");
                } else {
                    navigate("/");
                }
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
                    onSubmit={handleLogin}
                    className="glass p-10 rounded-[2.5rem] flex flex-col gap-8 shadow-glow transition-all duration-500 hover:border-orange-500/30"
                >
                    <div className="text-center flex flex-col gap-3">
                        <h2 className="text-4xl font-black font-outfit text-glow uppercase tracking-tight">Welcome Back</h2>
                        <p className="text-neutral-400 text-sm font-light">Continue your learning journey with ChaiCode.</p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] pl-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={credentials.email}
                                onChange={handleChange}
                                placeholder="name@domain.com"
                                className="input-field"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em]">Password</label>
                                <span 
                                    onClick={() => navigate("/forgot-password")}
                                    className="text-xs font-semibold text-orange-500 hover:text-orange-400 cursor-pointer transition-colors"
                                >
                                    Forgot?
                                </span>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="••••••••"
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
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>

                    <p className="text-center text-neutral-400 text-sm mt-2">
                        Don't have an account?{" "}
                        <span 
                            className="text-white font-bold cursor-pointer hover:text-orange-400 transition-colors"
                            onClick={() => navigate("/signup")}
                        >
                            Create One
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
