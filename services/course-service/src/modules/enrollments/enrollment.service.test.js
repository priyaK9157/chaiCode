import { describe, it, expect, vi, beforeEach } from "vitest";
import * as enrollmentService from "./enrollment.service.js";
import prisma from "../../config/db.js";

// Mock Prisma
vi.mock("../../config/db.js", () => {
  return {
    default: {
      enrollment: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  };
});

describe("enrollment.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEnrollment", () => {
    it("should successfully create a completed enrollment for a student", async () => {
      const mockEnrollment = { id: "enrollment-1", studentId: "student-1", courseId: "course-1", status: "COMPLETED" };
      prisma.enrollment.create.mockResolvedValueOnce(mockEnrollment);

      const result = await enrollmentService.createEnrollment("student-1", "course-1");

      expect(prisma.enrollment.create).toHaveBeenCalledWith({
        data: {
          studentId: "student-1",
          courseId: "course-1",
          status: "COMPLETED",
        },
      });
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe("checkEnrollment", () => {
    it("should return true if active completed enrollment exists", async () => {
      prisma.enrollment.findFirst.mockResolvedValueOnce({ id: "enrollment-1" });

      const result = await enrollmentService.checkEnrollment("student-1", "course-1");

      expect(prisma.enrollment.findFirst).toHaveBeenCalledWith({
        where: {
          studentId: "student-1",
          courseId: "course-1",
          status: "COMPLETED",
        },
      });
      expect(result).toBe(true);
    });

    it("should return false if active completed enrollment does not exist", async () => {
      prisma.enrollment.findFirst.mockResolvedValueOnce(null);

      const result = await enrollmentService.checkEnrollment("student-1", "course-1");

      expect(prisma.enrollment.findFirst).toHaveBeenCalledWith({
        where: {
          studentId: "student-1",
          courseId: "course-1",
          status: "COMPLETED",
        },
      });
      expect(result).toBe(false);
    });
  });
});
