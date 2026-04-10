import express from "express";
import { createSection, updateSection, deleteSection } from "./section.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("INSTRUCTOR"));

router.post("/", createSection);
router.patch("/:id", updateSection);
router.delete("/:id", deleteSection);

export default router;
