import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "./auth.service.js";
import prisma from "../../config/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateToken } from "../utils/generateToken.js";

// Mock prisma database client
vi.mock("../../config/db.js", () => {
  return {
    default: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

// Mock hashPassword utilities
vi.mock("../utils/hashPassword.js", () => {
  return {
    hashPassword: vi.fn(async (password) => `hashed_${password}`),
    comparePassword: vi.fn(async (password, hash) => hash === `hashed_${password}`),
  };
});

// Mock generateToken utility
vi.mock("../utils/generateToken.js", () => {
  return {
    generateToken: vi.fn((user) => `mock_token_${user.id}`),
  };
});

// Mock global fetch for testing sendEmail
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("auth.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendEmail", () => {
    it("should successfully send an email", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: "12345" }),
      });

      await expect(
        authService.sendEmail("test@example.com", "Test Subject", "Test Text")
      ).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith("https://api.brevo.com/v3/smtp/email", expect.any(Object));
    });

    it("should throw an error if Brevo API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "API Error" }),
      });

      await expect(
        authService.sendEmail("test@example.com", "Test Subject", "Test Text")
      ).rejects.toThrow("Email sending failed: API Error");
    });
  });

  describe("register", () => {
    const registrationData = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "student",
    };

    it("should register a brand new user and send an OTP", async () => {
      // Mock user doesn't exist
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValueOnce({});
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: "msg-id-1" }),
      });

      const result = await authService.register(registrationData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: registrationData.email } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual({ message: "Verify OTP" });
    });

    it("should throw an error if user exists and is already verified", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        email: "john@example.com",
        isVerified: true,
      });

      await expect(authService.register(registrationData)).rejects.toThrow(
        "Email already registered. Please login."
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should update user and resend OTP if user exists but is not verified", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        email: "john@example.com",
        isVerified: false,
      });
      prisma.user.update.mockResolvedValueOnce({});
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: "msg-id-2" }),
      });

      const result = await authService.register(registrationData);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: registrationData.email },
        data: expect.objectContaining({
          name: registrationData.name,
          role: registrationData.role,
        }),
      });
      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual({ message: "Verify OTP" });
    });
  });

  describe("resendSignupOtp", () => {
    it("should resend OTP to unverified user", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        email: "john@example.com",
        isVerified: false,
      });
      prisma.user.update.mockResolvedValueOnce({});
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: "msg-id-3" }),
      });

      const result = await authService.resendSignupOtp("john@example.com");

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).toEqual({ message: "OTP resent successfully" });
    });

    it("should throw if user is not found", async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(authService.resendSignupOtp("john@example.com")).rejects.toThrow("User not found");
    });

    it("should throw if user is already verified", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        email: "john@example.com",
        isVerified: true,
      });

      await expect(authService.resendSignupOtp("john@example.com")).rejects.toThrow("User already verified");
    });
  });

  describe("verifySignup", () => {
    it("should verify user with valid OTP", async () => {
      const user = {
        id: 1,
        email: "john@example.com",
        isVerified: false,
        signupOtp: "123456",
        signupOtpExpiry: new Date(Date.now() + 5000),
      };

      prisma.user.findUnique.mockResolvedValueOnce(user);
      prisma.user.update.mockResolvedValueOnce({ ...user, isVerified: true });

      const result = await authService.verifySignup("john@example.com", "123456");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
        data: {
          isVerified: true,
          signupOtp: null,
          signupOtpExpiry: null,
        },
      });
      expect(result.token).toBe("mock_token_1");
    });

    it("should throw error if OTP is invalid", async () => {
      const user = {
        id: 1,
        email: "john@example.com",
        isVerified: false,
        signupOtp: "123456",
        signupOtpExpiry: new Date(Date.now() + 5000),
      };

      prisma.user.findUnique.mockResolvedValueOnce(user);

      await expect(authService.verifySignup("john@example.com", "wrongotp")).rejects.toThrow("Invalid OTP");
    });

    it("should throw error if OTP has expired", async () => {
      const user = {
        id: 1,
        email: "john@example.com",
        isVerified: false,
        signupOtp: "123456",
        signupOtpExpiry: new Date(Date.now() - 5000), // past expiry
      };

      prisma.user.findUnique.mockResolvedValueOnce(user);

      await expect(authService.verifySignup("john@example.com", "123456")).rejects.toThrow("OTP Expired");
    });
  });

  describe("login", () => {
    it("should log in successfully with correct credentials", async () => {
      const user = {
        id: 1,
        email: "john@example.com",
        password: "hashed_password123",
        isVerified: true,
      };

      prisma.user.findUnique.mockResolvedValueOnce(user);

      const result = await authService.login({
        email: "john@example.com",
        password: "password123",
      });

      expect(result.token).toBe("mock_token_1");
    });

    it("should throw error on incorrect credentials", async () => {
      const user = {
        id: 1,
        email: "john@example.com",
        password: "hashed_password123",
        isVerified: true,
      };

      prisma.user.findUnique.mockResolvedValueOnce(user);

      await expect(
        authService.login({
          email: "john@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error if user account is not verified", async () => {
      const user = {
        id: 1,
        email: "john@example.com",
        password: "hashed_password123",
        isVerified: false,
      };

      prisma.user.findUnique.mockResolvedValueOnce(user);

      await expect(
        authService.login({
          email: "john@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Account not verified. Please complete signup verification.");
    });
  });

  describe("forgotPassword", () => {
    it("should request password reset successfully", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: "john@example.com" });
      prisma.user.update.mockResolvedValueOnce({});
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: "msg-id-reset" }),
      });

      const result = await authService.forgotPassword("john@example.com");

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).toEqual({ message: "OTP sent successfully" });
    });
  });

  describe("verifyOtp", () => {
    it("should verify reset OTP successfully", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        email: "john@example.com",
        resetOtp: "654321",
        resetOtpExpiry: new Date(Date.now() + 5000),
      });

      const result = await authService.verifyOtp("john@example.com", "654321");
      expect(result).toEqual({ message: "OTP verified successfully" });
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: "john@example.com" });
      prisma.user.update.mockResolvedValueOnce({});

      const result = await authService.resetPassword("john@example.com", "newpassword123");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
        data: {
          password: "hashed_newpassword123",
          resetOtp: null,
          resetOtpExpiry: null,
        },
      });
      expect(result).toEqual({ message: "Password reset successful" });
    });
  });

  describe("deleteProfile", () => {
    it("should delete profile successfully", async () => {
      prisma.user.findUnique.mockResolvedValueOnce({ id: 1 });
      prisma.user.delete.mockResolvedValueOnce({});

      const result = await authService.deleteProfile(1);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ message: "Profile deleted successfully" });
    });
  });
});
