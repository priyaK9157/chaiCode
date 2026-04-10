import express from "express";
import courseRoutes from "./courses/course.routes.js";
import sectionRoutes from "./sections/section.routes.js";
import lessonRoutes from "./lessons/lesson.routes.js";
import paymentRoutes from "./payments/payment.routes.js";

const router = express.Router();

router.use("/courses", courseRoutes);
router.use("/sections", sectionRoutes);
router.use("/lessons", lessonRoutes);
router.use("/payments", paymentRoutes);

export default router;
