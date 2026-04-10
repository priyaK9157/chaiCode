import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, forgotPassword, verifyOtp, resetPassword, verifySignup, deleteProfile, resendSignupOtp } from "./auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 min
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // 3 signup attempts per 15 min
  message: { message: "Too many signup attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // 3 OTP resend per 15 min
  message: { message: "Too many OTP requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", registerLimiter, register);
router.post("/verify-signup", verifySignup);
router.post("/resend-signup-otp", otpLimiter, resendSignupOtp);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.delete("/profile", protect, deleteProfile);

export default router;
