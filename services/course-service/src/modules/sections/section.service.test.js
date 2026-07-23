import { describe, it, expect, vi, beforeEach } from "vitest";
import * as sectionService from "./section.service.js";
import prisma from "../../config/db.js";

// Mock Prisma
vi.mock("../../config/db.js", () => {
  return {
    default: {
      section: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  };
});

describe("section.service unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSection", () => {
    it("should successfully create a new section", async () => {
      const mockSection = { id: "section-1", title: "Introduction", courseId: "course-1" };
      prisma.section.create.mockResolvedValueOnce(mockSection);

      const result = await sectionService.createSection({
        title: "Introduction",
        courseId: "course-1",
      });

      expect(prisma.section.create).toHaveBeenCalledWith({
        data: {
          title: "Introduction",
          courseId: "course-1",
        },
      });
      expect(result).toEqual(mockSection);
    });
  });

  describe("updateSection", () => {
    it("should update an existing section with new values", async () => {
      const mockSection = { id: "section-1", title: "Updated Intro" };
      prisma.section.update.mockResolvedValueOnce(mockSection);

      const result = await sectionService.updateSection("section-1", { title: "Updated Intro" });

      expect(prisma.section.update).toHaveBeenCalledWith({
        where: { id: "section-1" },
        data: { title: "Updated Intro" },
      });
      expect(result).toEqual(mockSection);
    });
  });

  describe("deleteSection", () => {
    it("should delete a section by id", async () => {
      const mockSection = { id: "section-1" };
      prisma.section.delete.mockResolvedValueOnce(mockSection);

      const result = await sectionService.deleteSection("section-1");

      expect(prisma.section.delete).toHaveBeenCalledWith({
        where: { id: "section-1" },
      });
      expect(result).toEqual(mockSection);
    });
  });

  describe("getSectionById", () => {
    it("should return a section with course information", async () => {
      const mockSection = { id: "section-1", title: "Introduction", course: { id: "course-1" } };
      prisma.section.findUnique.mockResolvedValueOnce(mockSection);

      const result = await sectionService.getSectionById("section-1");

      expect(prisma.section.findUnique).toHaveBeenCalledWith({
        where: { id: "section-1" },
        include: {
          course: true,
        },
      });
      expect(result).toEqual(mockSection);
    });
  });
});
