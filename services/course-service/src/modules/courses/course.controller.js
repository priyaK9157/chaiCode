import * as courseService from "./course.service.js";

const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:5003';

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

    // Sync to Chatbot Service asynchronously
    fetch(`${CHATBOT_SERVICE_URL}/chatbot/sync-courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', course })
    }).catch(err => console.error("❌ Failed to sync course with chatbot-service:", err.message));

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

    // Sync to Chatbot Service asynchronously
    fetch(`${CHATBOT_SERVICE_URL}/chatbot/sync-courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', course: updated })
    }).catch(err => console.error("❌ Failed to sync course with chatbot-service:", err.message));

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

    // Sync deletion to Chatbot Service asynchronously
    fetch(`${CHATBOT_SERVICE_URL}/chatbot/sync-courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', courseId: req.params.id })
    }).catch(err => console.error("❌ Failed to sync delete with chatbot-service:", err.message));

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getEnrolledCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getEnrolledCourses(req.user.id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};
