import { describe, it, expect, vi, beforeEach } from "vitest";
import * as courseService from "./course.service.js";
import prisma from "../../config/db.js";

// Mock Prisma database client
vi.mock("../../config/db.js", () => {
  return {
    default: {
      course: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      lesson: {
        deleteMany: vi.fn(),
      },
      section: {
        deleteMany: vi.fn(),
      },
      enrollment: {
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
      fcmToken: {
        upsert: vi.fn(),
      },
    },
  };
});

// Mock Redis client to prevent real connection timeouts during tests
vi.mock("../../config/redis.js", () => {
  return {
    default: {
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
    },
  };
});

describe("course.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCourse", () => {
    it("should successfully create a course with parsed numeric price and boolean isPublished", async () => {
      const mockCourse = { id: "1", title: "Test Course" };
      prisma.course.create.mockResolvedValueOnce(mockCourse);

      const data = {
        title: "Test Course",
        description: "Test Description",
        price: "99.99",
        isPublished: "true",
        thumbnailUrl: "http://image.jpg",
      };

      const result = await courseService.createCourse(data, "instructor-123");

      expect(prisma.course.create).toHaveBeenCalledWith({
        data: {
          title: "Test Course",
          description: "Test Description",
          price: 99.99,
          isPublished: true,
          thumbnailUrl: "http://image.jpg",
          instructorId: "instructor-123",
        },
      });
      expect(result).toEqual(mockCourse);
    });
  });

  describe("getCourses", () => {
    it("should return all published courses", async () => {
      const mockCourses = [{ id: "1", title: "Course 1" }];
      prisma.course.findMany.mockResolvedValueOnce(mockCourses);

      const result = await courseService.getCourses();

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockCourses);
    });
  });

  describe("getCourseById", () => {
    it("should return a course by stringified id", async () => {
      const mockCourse = { id: "1", title: "Course 1" };
      prisma.course.findUnique.mockResolvedValueOnce(mockCourse);

      const result = await courseService.getCourseById(1);

      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockCourse);
    });
  });

  describe("getInstructorCourses", () => {
    it("should return courses belonging to an instructor", async () => {
      const mockCourses = [{ id: "1", title: "Instructor Course" }];
      prisma.course.findMany.mockResolvedValueOnce(mockCourses);

      const result = await courseService.getInstructorCourses("instructor-123");

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { instructorId: "instructor-123" },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockCourses);
    });
  });

  describe("updateCourse", () => {
    it("should update course fields and parse values properly", async () => {
      const mockCourse = { id: "1", title: "Updated Title" };
      prisma.course.update.mockResolvedValueOnce(mockCourse);

      const data = {
        title: "Updated Title",
        price: "49.99",
        isPublished: "true",
      };

      const result = await courseService.updateCourse("1", data);

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          title: "Updated Title",
          price: 49.99,
          isPublished: true,
        },
      });
      expect(result).toEqual(mockCourse);
    });
  });

  describe("deleteCourse", () => {
    it("should delete course and cascadingly delete section, lesson and enrollments first", async () => {
      prisma.lesson.deleteMany.mockResolvedValueOnce({ count: 1 });
      prisma.section.deleteMany.mockResolvedValueOnce({ count: 1 });
      prisma.enrollment.deleteMany.mockResolvedValueOnce({ count: 1 });
      prisma.course.delete.mockResolvedValueOnce({ id: "1" });

      const result = await courseService.deleteCourse("1");

      expect(prisma.lesson.deleteMany).toHaveBeenCalledWith({
        where: { section: { courseId: "1" } },
      });
      expect(prisma.section.deleteMany).toHaveBeenCalledWith({
        where: { courseId: "1" },
      });
      expect(prisma.enrollment.deleteMany).toHaveBeenCalledWith({
        where: { courseId: "1" },
      });
      expect(prisma.course.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual({ id: "1" });
    });
  });

  describe("getEnrolledCourses", () => {
    it("should return the list of courses enrolled by student", async () => {
      const mockEnrollments = [
        {
          id: "enroll-1",
          course: { id: "course-1", title: "Enrolled Course" },
        },
      ];
      prisma.enrollment.findMany.mockResolvedValueOnce(mockEnrollments);

      const result = await courseService.getEnrolledCourses("student-123");

      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: {
          studentId: "student-123",
          status: "COMPLETED",
        },
        include: {
          course: expect.any(Object),
        },
      });
      expect(result).toEqual([{ id: "course-1", title: "Enrolled Course" }]);
    });
  });

  describe("saveFcmToken", () => {
    it("should successfully save or update an FCM token for a user", async () => {
      const mockFcmToken = { id: "token-1", userId: "user-123", token: "mock-fcm-token" };
      prisma.fcmToken.upsert.mockResolvedValueOnce(mockFcmToken);

      const result = await courseService.saveFcmToken("user-123", "mock-fcm-token");

      expect(prisma.fcmToken.upsert).toHaveBeenCalledWith({
        where: { token: "mock-fcm-token" },
        update: { userId: "user-123" },
        create: { userId: "user-123", token: "mock-fcm-token" },
      });
      expect(result).toEqual(mockFcmToken);
    });
  });
});
