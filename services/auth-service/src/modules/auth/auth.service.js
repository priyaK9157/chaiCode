import prisma from "../../config/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";

// Helper to throw errors with custom status codes
const throwError = (message, status = 500) => {
  const err = new Error(message);
  err.status = status;
  throw err;
};

export const sendEmail = async (email, subject, text) => {
  if (!process.env.BREVO_API_KEY) {
    console.log(`[Email Service Mock] (No BREVO_API_KEY) Mock sending email to ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return;
  }

  console.log(`[Email] Attempting to send email to ${email} via Brevo API...`);
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM_NAME || "Chai Code",
          email: process.env.EMAIL_FROM || process.env.EMAIL_USER || "sendmailpriya4@gmail.com"
        },
        to: [{ email: email }],
        subject: subject,
        textContent: text
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }
    console.log(`[Email] Successfully sent via Brevo: ${data.messageId || JSON.stringify(data)}`);
  } catch (error) {
    console.error("[Email] Brevo API failed:", error);
    throwError(`Email sending failed: ${error.message}`, 500);
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
      throwError("Email already registered. Please login.", 400);
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
  if (!user) throwError("User not found", 404);
  if (user.isVerified) throwError("User already verified", 400);

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
  if (!user) throwError("User not found", 404);
  if (user.isVerified) throwError("User already verified", 400);

  if (user.signupOtp !== otp) throwError("Invalid OTP", 400);
  if (user.signupOtpExpiry < new Date()) throwError("OTP Expired", 400);

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

  if (!user) throwError("User not found", 404);

  if (!user.isVerified) {
    throwError("Account not verified. Please complete signup verification.", 401);
  }

  const valid = await comparePassword(data.password, user.password);
  if (!valid) throwError("Invalid credentials", 401);

  return {
    user,
    token: generateToken(user)
  };
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throwError("User not found", 404);

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
  if (!user) throwError("User not found", 404);

  if (user.resetOtp !== otp) throwError("Invalid OTP", 400);
  if (user.resetOtpExpiry < new Date()) throwError("OTP Expired", 400);

  return { message: "OTP verified successfully" };
};

export const resetPassword = async (email, newPassword) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throwError("User not found", 404);

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
  if (!user) throwError("User not found", 404);

  await prisma.user.delete({ where: { id: userId } });
  return { message: "Profile deleted successfully" };
};
