import * as lessonService from "./lesson.service.js";
import { getSectionById } from "../sections/section.service.js";
import { checkEnrollment } from "../enrollments/enrollment.service.js";

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

    let finalVideoUrl = videoUrl;
    if (req.file) {
      finalVideoUrl = req.file.path;
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ message: "Video file or URL is required" });
    }

    const lesson = await lessonService.createLesson({
      title,
      videoUrl: finalVideoUrl,
      duration: duration ? parseInt(duration) : 0,
      order: order ? parseInt(order) : 0,
      isPreview: isPreview === 'true' || isPreview === true,
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
    if (req.file) {
      updatedData.videoUrl = req.file.path;
    }
    if (updatedData.duration) updatedData.duration = parseInt(updatedData.duration);
    if (updatedData.order) updatedData.order = parseInt(updatedData.order);
    if (updatedData.isPreview !== undefined) {
      updatedData.isPreview = updatedData.isPreview === 'true' || updatedData.isPreview === true;
    }

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

export const getLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await lessonService.getLessonById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const courseId = lesson.section.course.id;

    // 1. If user is the instructor who owns the course, allow
    if (lesson.section.course.instructorId === req.user.id) {
      return res.json(lesson);
    }

    // 2. If lesson is a preview, allow
    if (lesson.isPreview) {
      return res.json(lesson);
    }

    // 3. Otherwise, check enrollment
    const isEnrolled = await checkEnrollment(req.user.id, courseId);
    if (!isEnrolled) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    res.json(lesson);
  } catch (err) {
    next(err);
  }
};
