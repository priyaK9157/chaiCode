import { describe, it, expect, vi, beforeEach } from "vitest";
import { protect } from "./auth.middleware.js";
import { allowRoles } from "./role.middleware.js";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => {
  return {
    default: {
      verify: vi.fn(),
    },
  };
});

describe("middleware unit tests", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe("auth.middleware (protect)", () => {
    it("should return 401 if authorization header is missing", () => {
      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow access and set req.user if token is 'mock-token'", () => {
      req.headers.authorization = "Bearer mock-token";

      protect(req, res, next);

      expect(req.user).toEqual({ id: "mock-instructor-id", role: "INSTRUCTOR" });
      expect(next).toHaveBeenCalled();
    });

    it("should allow access and set req.user if token is valid jwt", () => {
      req.headers.authorization = "Bearer valid-jwt";
      const mockDecoded = { id: "user-123", role: "STUDENT" };
      jwt.verify.mockReturnValueOnce(mockDecoded);

      protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith("valid-jwt", env.JWT_SECRET);
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalled();
    });

    it("should return 401 if jwt verification fails", () => {
      req.headers.authorization = "Bearer invalid-jwt";
      jwt.verify.mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("role.middleware (allowRoles)", () => {
    it("should return 403 if user role is not in the allowed list", () => {
      req.user = { role: "STUDENT" };
      const middleware = allowRoles("INSTRUCTOR", "ADMIN");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow request if user role is in the allowed list", () => {
      req.user = { role: "INSTRUCTOR" };
      const middleware = allowRoles("INSTRUCTOR", "ADMIN");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
