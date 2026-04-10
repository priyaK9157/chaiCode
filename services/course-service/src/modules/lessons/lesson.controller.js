import * as lessonService from "./lesson.service.js";
import { getSectionById } from "../sections/section.service.js";

export const createLesson = async (req, res, next) => {
  try {
    const { sectionId, title, videoUrl, duration, order, isPreview } = req.body;
    const section = await getSectionById(sectionId);

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Verify ownership through course
    if (section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const lesson = await lessonService.createLesson({
      title,
      videoUrl,
      duration: parseInt(duration),
      order: order || 0,
      isPreview: !!isPreview,
      sectionId
    });

    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Verify ownership through course
    if (lesson.section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedData = { ...req.body };
    if (updatedData.duration) updatedData.duration = parseInt(updatedData.duration);
    if (updatedData.isPreview !== undefined) updatedData.isPreview = !!updatedData.isPreview;

    const updatedLesson = await lessonService.updateLesson(id, updatedData);
    res.json(updatedLesson);
  } catch (err) {
    next(err);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Verify ownership through course
    if (lesson.section.course.instructorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await lessonService.deleteLesson(id);
    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    next(err);
  }
};
