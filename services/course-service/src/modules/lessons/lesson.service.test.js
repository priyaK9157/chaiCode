import { describe, it, expect, vi, beforeEach } from "vitest";
import * as lessonService from "./lesson.service.js";
import prisma from "../../config/db.js";

// Mock Prisma
vi.mock("../../config/db.js", () => {
  return {
    default: {
      lesson: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  };
});

describe("lesson.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLesson", () => {
    it("should successfully create a new lesson", async () => {
      const mockLesson = { id: "lesson-1", title: "Video Intro", sectionId: "section-1" };
      prisma.lesson.create.mockResolvedValueOnce(mockLesson);

      const result = await lessonService.createLesson({
        title: "Video Intro",
        videoUrl: "http://video.mp4",
        duration: 300,
        sectionId: "section-1",
      });

      expect(prisma.lesson.create).toHaveBeenCalledWith({
        data: {
          title: "Video Intro",
          videoUrl: "http://video.mp4",
          duration: 300,
          sectionId: "section-1",
        },
      });
      expect(result).toEqual(mockLesson);
    });
  });

  describe("updateLesson", () => {
    it("should update an existing lesson with new details", async () => {
      const mockLesson = { id: "lesson-1", title: "Updated Lesson" };
      prisma.lesson.update.mockResolvedValueOnce(mockLesson);

      const result = await lessonService.updateLesson("lesson-1", { title: "Updated Lesson" });

      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson-1" },
        data: { title: "Updated Lesson" },
      });
      expect(result).toEqual(mockLesson);
    });
  });

  describe("deleteLesson", () => {
    it("should delete a lesson by id", async () => {
      const mockLesson = { id: "lesson-1" };
      prisma.lesson.delete.mockResolvedValueOnce(mockLesson);

      const result = await lessonService.deleteLesson("lesson-1");

      expect(prisma.lesson.delete).toHaveBeenCalledWith({
        where: { id: "lesson-1" },
      });
      expect(result).toEqual(mockLesson);
    });
  });

  describe("getLessonById", () => {
    it("should retrieve a lesson with section and course details", async () => {
      const mockLesson = {
        id: "lesson-1",
        title: "Lesson 1",
        section: {
          id: "section-1",
          course: { id: "course-1" },
        },
      };
      prisma.lesson.findUnique.mockResolvedValueOnce(mockLesson);

      const result = await lessonService.getLessonById("lesson-1");

      expect(prisma.lesson.findUnique).toHaveBeenCalledWith({
        where: { id: "lesson-1" },
        include: {
          section: {
            include: {
              course: true,
            },
          },
        },
      });
      expect(result).toEqual(mockLesson);
    });
  });
});
