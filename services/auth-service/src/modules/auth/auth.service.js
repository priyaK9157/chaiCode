import prisma from "../../config/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";
import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`[Email] Attempting to send email to ${email}...`);
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text
      });
      console.log(`[Email] Successfully sent: ${info.response}`);
    } else {
      console.log("[Email] Skipped sending real email (Credentials not set).");
    }
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
  }
};

export const register = async (data) => {
  const hashed = await hashPassword(data.password);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new Error("Email already registered. Please login.");
    }

    // User exists but not verified — update their details and resend OTP
    await prisma.user.update({
      where: { email: data.email },
      data: {
        name: data.name,
        password: hashed,
        role: data.role,
        signupOtp: otp,
        signupOtpExpiry: expiry
      }
    });

    console.log(`[Email Service Mock] Resending Signup OTP to ${data.email}: ${otp}`);
    await sendEmail(data.email, "Your Signup OTP", `Your OTP is ${otp}. It is valid for 10 minutes.`);

    return { message: "Verify OTP" };
  }

  // Brand new user
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
      isVerified: false,
      signupOtp: otp,
      signupOtpExpiry: expiry
    }
  });

  console.log(`[Email Service Mock] Sending Signup OTP to ${data.email}: ${otp}`);
  await sendEmail(data.email, "Your Signup OTP", `Your OTP is ${otp}. It is valid for 10 minutes.`);

  return { message: "Verify OTP" };
};

export const resendSignupOtp = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { signupOtp: otp, signupOtpExpiry: expiry }
  });

  console.log(`[Email Service Mock] Resending Signup OTP to ${email}: ${otp}`);
  await sendEmail(email, "Your Signup OTP (Resend)", `Your OTP is ${otp}. It is valid for 10 minutes.`);

  return { message: "OTP resent successfully" };
};

export const verifySignup = async (email, otp) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  if (user.signupOtp !== otp) throw new Error("Invalid OTP");
  if (user.signupOtpExpiry < new Date()) throw new Error("OTP Expired");

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      signupOtp: null,
      signupOtpExpiry: null
    }
  });

  return {
    user: updatedUser,
    token: generateToken(updatedUser)
  };
};

export const login = async (data) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) throw new Error("User not found");

  if (!user.isVerified) {
    throw new Error("Account not verified. Please complete signup verification.");
  }

  const valid = await comparePassword(data.password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  return {
    user,
    token: generateToken(user)
  };
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { email },
    data: { resetOtp: otp, resetOtpExpiry: expiry }
  });

  console.log(`[Email Service Mock] Sending Password Reset OTP to ${email}: ${otp}`);
  await sendEmail(email, "Your Password Reset OTP", `Your OTP is ${otp}. It is valid for 10 minutes.`);

  return { message: "OTP sent successfully" };
};

export const verifyOtp = async (email, otp) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  if (user.resetOtp !== otp) throw new Error("Invalid OTP");
  if (user.resetOtpExpiry < new Date()) throw new Error("OTP Expired");

  return { message: "OTP verified successfully" };
};

export const resetPassword = async (email, newPassword) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const hashed = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashed,
      resetOtp: null,
      resetOtpExpiry: null
    }
  });

  return { message: "Password reset successful" };
};

export const deleteProfile = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.delete({ where: { id: userId } });
  return { message: "Profile deleted successfully" };
};
