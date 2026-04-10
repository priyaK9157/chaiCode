import express from "express";
import * as paymentController from "./payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/checkout-session", protect, paymentController.createCheckoutSession);
router.post("/webhook", express.raw({ type: "application/json" }), paymentController.handleWebhook);

export default router;
