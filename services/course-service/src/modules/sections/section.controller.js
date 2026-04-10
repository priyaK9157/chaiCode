import * as sectionService from "./section.service.js";
import { getCourseById } from "../courses/course.service.js";

export const createSection = async (req, res, next) => {
  try {
    const { courseId, title, order } = req.body;
    const course = await getCourseById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify ownership
    if (course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const section = await sectionService.createSection({
      title,
      order: order || 0,
      courseId
    });

    res.status(201).json(section);
  } catch (err) {
    next(err);
  }
};

export const updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const section = await sectionService.getSectionById(id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Verify ownership through course
    if (section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedSection = await sectionService.updateSection(id, req.body);
    res.json(updatedSection);
  } catch (err) {
    next(err);
  }
};

export const deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const section = await sectionService.getSectionById(id);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Verify ownership through course
    if (section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await sectionService.deleteSection(id);
    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    next(err);
  }
};
