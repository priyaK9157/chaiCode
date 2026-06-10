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

export const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const studentId = req.user.id; // From protect middleware

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    console.log(`🔍 [Payment Controller] Verifying checkout session: ${sessionId} for student: ${studentId}`);

    if (sessionId.startsWith("mock_")) {
      const courseId = sessionId.substring(5);
      console.log(`💡 [Payment Controller] Mock session detected. Auto-enrolling course: ${courseId}`);
      
      // Check if already enrolled
      const isAlreadyEnrolled = await enrollmentService.checkEnrollment(studentId, courseId);
      if (!isAlreadyEnrolled) {
        await enrollmentService.createEnrollment(studentId, courseId);
        console.log(`✅ [Payment Verification] Enrolled student ${studentId} in course ${courseId}`);
      } else {
        console.log(`ℹ️ [Payment Verification] Student ${studentId} already enrolled in course ${courseId}`);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully", 
        courseId 
      });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid" || session.status === "complete") {
      const courseId = session.metadata.courseId;
      const sessionStudentId = session.metadata.studentId;

      if (sessionStudentId !== studentId) {
        return res.status(403).json({ message: "User mismatch on payment session" });
      }

      // Check if already enrolled
      const isAlreadyEnrolled = await enrollmentService.checkEnrollment(studentId, courseId);
      if (!isAlreadyEnrolled) {
        await enrollmentService.createEnrollment(studentId, courseId);
        console.log(`✅ [Payment Verification] Enrolled student ${studentId} in course ${courseId}`);
      } else {
        console.log(`ℹ️ [Payment Verification] Student ${studentId} already enrolled in course ${courseId}`);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully", 
        courseId 
      });
    } else {
      console.warn(`⚠️ [Payment Controller] Session is unpaid: ${session.payment_status}`);
      return res.status(400).json({ 
        success: false, 
        message: `Payment status: ${session.payment_status}` 
      });
    }
  } catch (error) {
    console.error("❌ [Payment Controller] Error verifying session:", error.message || error);
    res.status(500).json({ 
      message: "Could not verify payment session",
      error: error.message 
    });
  }
};

export const checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const isEnrolled = await enrollmentService.checkEnrollment(studentId, courseId);
    console.log(`🔍 [Payment Controller] Checked enrollment for student: ${studentId}, course: ${courseId} -> Enrolled: ${isEnrolled}`);

    return res.status(200).json({ 
      success: true, 
      enrolled: isEnrolled 
    });
  } catch (error) {
    console.error("❌ [Payment Controller] Error checking enrollment status:", error.message || error);
    res.status(500).json({ 
      message: "Could not check enrollment status",
      error: error.message 
    });
  }
};
