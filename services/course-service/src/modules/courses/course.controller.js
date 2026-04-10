import * as courseService from "./course.service.js";

export const createCourse = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file && req.file.path) {
      // Cloudinary attaches the remote URL directly to req.file.path
      payload.thumbnailUrl = req.file.path;
    }
    console.log("📥 [Course Service] createCourse called with:", payload);
    const course = await courseService.createCourse(payload, req.user.id);
    console.log("✅ [Course Service] Course created successfully:", course);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    console.log("📥 [Course Service] getCourseById called with ID:", req.params.id);
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};
export const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user.id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const payload = { ...req.body };
    if (req.file && req.file.path) {
      payload.thumbnailUrl = req.file.path;
    }
    const updated = await courseService.updateCourse(req.params.id, payload);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructorId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    await courseService.deleteCourse(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};
