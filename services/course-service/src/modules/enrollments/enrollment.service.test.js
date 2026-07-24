import { describe, it, expect, vi, beforeEach } from "vitest";
import * as enrollmentService from "./enrollment.service.js";
import prisma from "../../config/db.js";

// Mock Prisma database client
vi.mock("../../config/db.js", () => {
  const localMockPrisma = {
    enrollment: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    outboxEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => cb(localMockPrisma)),
  };
  return {
    default: localMockPrisma,
  };
});

describe("enrollment.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEnrollment", () => {
    it("should successfully create a completed enrollment and outbox event in a transaction", async () => {
      const mockCreatedAt = new Date();
      const mockEnrollment = { id: "enrollment-1", studentId: "student-1", courseId: "course-1", status: "COMPLETED", createdAt: mockCreatedAt };
      prisma.enrollment.create.mockResolvedValueOnce(mockEnrollment);
      prisma.outboxEvent.create.mockResolvedValueOnce({ id: "event-1" });

      const result = await enrollmentService.createEnrollment("student-1", "course-1");

      expect(prisma.enrollment.create).toHaveBeenCalledWith({
        data: {
          studentId: "student-1",
          courseId: "course-1",
          status: "COMPLETED",
        },
      });
      expect(prisma.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          eventType: "ENROLLMENT_CREATED",
          payload: JSON.stringify({
            enrollmentId: "enrollment-1",
            studentId: "student-1",
            courseId: "course-1",
            status: "COMPLETED",
            createdAt: mockCreatedAt,
          }),
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
