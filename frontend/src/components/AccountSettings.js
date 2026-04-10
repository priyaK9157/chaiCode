import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "../store/authSlice";
import BackgroundImage from "../common/BackgroundImage";
import Navbar from "../common/Navbar";

const AccountSettings = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token } = useSelector((state) => state.auth);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("Passwords do not match");

        try {
            const response = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ email: user.email, newPassword: password }),
            });

            if (response.ok) {
                alert("Password updated successfully!");
                setPassword("");
                setConfirmPassword("");
            } else {
                const data = await response.json();
                alert(data.message || "Failed to update password");
            }
        } catch (err) {
            alert("Error updating password");
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm("CRITICAL: Are you absolutely sure? This will permanently delete your profile and all course progress.")) {
            dispatch(deleteProfile())
                .unwrap()
                .then(() => {
                    navigate("/");
                })
                .catch((err) => {
                    alert(err);
                });
        }
    };

    return (
        <div className="relative min-h-screen bg-mesh py-32 px-4 flex items-center justify-center">
            <BackgroundImage />
            <Navbar />

            <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">
                {/* Header Section */}
                <div className="text-center flex flex-col gap-2">
                    <h1 className="text-5xl font-black font-outfit text-glow uppercase tracking-tighter">Account Settings</h1>
                    <p className="text-neutral-400 font-medium">Manage your security and profile preferences</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Password Update Card */}
                    <div className="glass p-8 rounded-[2rem] flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold font-outfit text-white">Security</h2>
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Update your password</p>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field py-3 text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field py-3 text-sm"
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-3 mt-2 text-sm font-bold uppercase tracking-tight">
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone Card */}
                    <div className="glass p-8 rounded-[2rem] border-red-500/20 flex flex-col justify-between gap-6">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold font-outfit text-red-500">Danger Zone</h2>
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Destructive Actions</p>
                        </div>
                        
                        <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                            <p className="text-xs leading-relaxed text-red-200/60 font-medium">
                                Once you delete your account, there is no going back. All your data will be permanently wiped from our systems.
                            </p>
                        </div>

                        <button 
                            onClick={handleDeleteAccount}
                            className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold uppercase tracking-tight hover:bg-red-500 hover:text-white transition-all duration-300"
                        >
                            Delete Profile
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => navigate("/")}
                    className="text-center text-neutral-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;
