import * as paymentService from "./payment.service.js";
import * as enrollmentService from "../enrollments/enrollment.service.js";
import * as courseService from "../courses/course.service.js";
import stripe from "../../config/stripe.js";
import env from "../../config/env.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    console.log(`💳 [Payment Controller] Creating session for Course: ${courseId}, Student: ${studentId}`);

    const course = await courseService.getCourseById(courseId);
    if (!course) {
      console.error(`❌ [Payment Controller] Course not found: ${courseId}`);
      return res.status(404).json({ message: "Course not found" });
    }

    const session = await paymentService.createCheckoutSession(course, studentId);
    console.log(`✅ [Payment Controller] Session created: ${session.id}`);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ [Payment Controller] Error:", error.message || error);
    res.status(500).json({ 
      message: "Could not create checkout session",
      error: error.message 
    });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { courseId, studentId } = session.metadata;

    await enrollmentService.createEnrollment(studentId, courseId);
    console.log(`✅ Payment successful. Student ${studentId} enrolled in ${courseId}`);
  }

  res.json({ received: true });
};
