import React, { useState } from "react";
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    setToggle(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4 md:px-8 lg:px-28">
      <div className="max-w-7xl mx-auto glass rounded-3xl px-6 md:px-8 py-4 flex justify-between items-center border border-white/10 shadow-2xl">
        <Link to="/" className="text-2xl md:text-3xl font-black font-outfit text-glow tracking-tighter hover:scale-105 transition-transform">
          CHAI<span className="text-orange-500">CODE</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-neutral-300">
          <li className="hover:text-white cursor-pointer transition-colors"><Link to="/">Home</Link></li>
          <li className="hover:text-white cursor-pointer transition-colors"><Link to="/cohorts">Cohorts</Link></li>
          <li className="hover:text-white cursor-pointer transition-colors"><Link to="/reviews">Reviews</Link></li>
          {isAuthenticated && (
            <li className="hover:text-orange-400 cursor-pointer transition-colors text-orange-500"><Link to="/dashboard">Dashboard</Link></li>
          )}
        </ul>

        <div className="flex items-center gap-4 md:gap-6">
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setToggle(!toggle)}
                className="flex items-center gap-2 md:gap-3 bg-white/5 hover:bg-white/10 p-2 pl-3 md:pl-4 rounded-full border border-white/10 transition-all group"
              >
                <span className="text-xs font-bold text-neutral-300 group-hover:text-white max-w-[80px] md:max-w-none truncate">{user?.name}</span>
                <div className="bg-orange-500 p-1.5 md:p-2 rounded-full shadow-glow-sm">
                  <FiUser className="text-white text-xs md:text-sm" />
                </div>
              </button>

              {toggle && (
                <div className="absolute right-0 mt-4 w-60 md:w-64 glass-dark rounded-3xl border border-white/10 shadow-3xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                  <div className="p-5 md:p-6 bg-white/5 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Member</p>
                    <p className="text-base md:text-lg font-bold truncate text-white">{user?.name}</p>
                  </div>
                  <ul className="py-2">
                    {isAuthenticated && (
                      <li 
                        onClick={() => { navigate("/dashboard"); setToggle(false); }}
                        className="px-5 md:px-6 py-3 md:py-4 flex items-center gap-3 hover:bg-white/5 cursor-pointer text-white font-bold transition-all group border-b border-white/5"
                      >
                        <FiUser className="text-neutral-500 group-hover:text-orange-500 transition-colors" />
                        Dashboard
                      </li>
                    )}
                    <li 
                      onClick={() => { navigate("/settings"); setToggle(false); }}
                      className="px-5 md:px-6 py-3 md:py-4 flex items-center gap-3 hover:bg-white/5 cursor-pointer text-white font-bold transition-all group"
                    >
                      <FiSettings className="text-neutral-500 group-hover:text-orange-500 transition-colors" />
                      Account Settings
                    </li>
                    <li 
                      onClick={handleLogout}
                      className="px-5 md:px-6 py-3 md:py-4 flex items-center gap-3 hover:bg-red-500/10 cursor-pointer text-red-400 font-bold transition-all group border-t border-white/5"
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
              className="btn-primary py-2.5 px-6 md:py-3 md:px-8 text-xs font-black uppercase tracking-widest"
            >
              Get Started
            </button>
          )}

          <button 
            className="lg:hidden text-white text-2xl hover:text-orange-500 transition-colors" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-center items-center gap-8 animate-in fade-in duration-300">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-8 right-8 text-white text-3xl hover:text-orange-500 transition-colors"
          >
            <FiX />
          </button>
          <ul className="flex flex-col items-center gap-8 text-xl font-bold uppercase tracking-widest text-neutral-300">
            <li onClick={() => setMobileMenuOpen(false)} className="hover:text-white cursor-pointer transition-colors"><Link to="/">Home</Link></li>
            <li onClick={() => setMobileMenuOpen(false)} className="hover:text-white cursor-pointer transition-colors"><Link to="/cohorts">Cohorts</Link></li>
            <li onClick={() => setMobileMenuOpen(false)} className="hover:text-white cursor-pointer transition-colors"><Link to="/reviews">Reviews</Link></li>
            {isAuthenticated && (
              <li onClick={() => setMobileMenuOpen(false)} className="hover:text-orange-400 cursor-pointer transition-colors text-orange-500"><Link to="/dashboard">Dashboard</Link></li>
            )}
            {isAuthenticated && (
              <li onClick={() => setMobileMenuOpen(false)} className="hover:text-white cursor-pointer transition-colors"><Link to="/settings">Settings</Link></li>
            )}
          </ul>
          {!isAuthenticated ? (
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
              className="btn-primary py-4 px-12 text-sm font-black uppercase tracking-widest mt-4"
            >
              Get Started
            </button>
          ) : (
            <button 
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="py-3 px-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-300 mt-4"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
