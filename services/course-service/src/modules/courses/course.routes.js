import express from "express";
import { createCourse, getCourses, getCourseById, getInstructorCourses, updateCourse, deleteCourse } from "./course.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { uploadCloud } from "../../config/cloudinary.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/instructor", protect, allowRoles("INSTRUCTOR"), getInstructorCourses);
router.get("/:id", getCourseById);
router.post("/", protect, allowRoles("INSTRUCTOR"), uploadCloud.single("thumbnail"), createCourse);
router.patch("/:id", protect, allowRoles("INSTRUCTOR"), uploadCloud.single("thumbnail"), updateCourse);
router.delete("/:id", protect, allowRoles("INSTRUCTOR"), deleteCourse);

export default router;
