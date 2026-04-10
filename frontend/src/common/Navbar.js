import React, { useState } from "react";
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 lg:px-28">
      <div className="max-w-7xl mx-auto glass rounded-3xl px-8 py-4 flex justify-between items-center border border-white/10 shadow-2xl">
        <Link to="/" className="text-3xl font-black font-outfit text-glow tracking-tighter hover:scale-105 transition-transform">
          CHAI<span className="text-orange-500">CODE</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-neutral-300">
          <li className="hover:text-white cursor-pointer transition-colors"><Link to="/">Home</Link></li>
          <li className="hover:text-white cursor-pointer transition-colors"><Link to="/cohorts">Cohorts</Link></li>
          <li className="hover:text-white cursor-pointer transition-colors"><Link to="/reviews">Reviews</Link></li>
          {user?.role === "INSTRUCTOR" && (
            <li className="hover:text-orange-400 cursor-pointer transition-colors text-orange-500"><Link to="/instructor">Dashboard</Link></li>
          )}
        </ul>

        <div className="flex items-center gap-6 ">
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setToggle(!toggle)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-2 pl-4 rounded-full border border-white/10 transition-all group"
              >
                <span className="text-xs font-bold text-neutral-300 group-hover:text-white">{user?.name}</span>
                <div className="bg-orange-500 p-2 rounded-full shadow-glow-sm">
                  <FiUser className="text-white" />
                </div>
              </button>

              {toggle && (
                <div className="absolute right-0 mt-4 w-64 glass-dark rounded-3xl border border-white/10 shadow-3xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-6 bg-white/5 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Member</p>
                    <p className="text-lg font-bold truncate text-white">{user?.name}</p>
                  </div>
                  <ul className="py-2">
                    {user?.role === "INSTRUCTOR" && (
                      <li 
                        onClick={() => { navigate("/instructor"); setToggle(false); }}
                        className="px-6 py-4 flex items-center gap-3 hover:bg-white/5 cursor-pointer text-white font-bold transition-all group border-b border-white/5"
                      >
                        <FiUser className="text-neutral-500 group-hover:text-orange-500 transition-colors" />
                        Instructor Panel
                      </li>
                    )}
                    <li 
                      onClick={() => { navigate("/settings"); setToggle(false); }}
                      className="px-6 py-4 flex items-center gap-3 hover:bg-white/5 cursor-pointer text-white font-bold transition-all group"
                    >
                      <FiSettings className="text-neutral-500 group-hover:text-orange-500 transition-colors" />
                      Account Settings
                    </li>
                    <li 
                      onClick={handleLogout}
                      className="px-6 py-4 flex items-center gap-3 hover:bg-red-500/10 cursor-pointer text-red-400 font-bold transition-all group border-t border-white/5"
                    >
                      <FiLogOut className="group-hover:translate-x-1 transition-transform" />
                      Sign Out
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate("/login")}
              className="btn-primary py-3 px-8 text-xs font-black uppercase tracking-widest"
            >
              Get Started
            </button>
          )}

          <button className="lg:hidden text-white text-2xl" onClick={() => setToggle(!toggle)}>
            {toggle ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
