import express from "express";
import { createLesson, updateLesson, deleteLesson, getLesson } from "./lesson.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/:id", getLesson);

router.use(allowRoles("INSTRUCTOR"));

router.post("/", createLesson);
router.patch("/:id", updateLesson);
router.delete("/:id", deleteLesson);

export default router;
