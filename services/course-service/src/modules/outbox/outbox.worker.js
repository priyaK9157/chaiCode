import prisma from "../../config/db.js";
import { admin, isFirebaseInitialized } from "../../config/firebase.js";

let isRunning = false;

// Send Push Notification
const sendFcmNotification = async (userId, title, body) => {
  if (!isFirebaseInitialized) {
    console.log(`🔔 [Mock] Push notification to ${userId}`);
    return;
  }

  try {
    const fcmToken = await prisma.fcmToken.findFirst({
      where: { userId },
    });

    if (!fcmToken) {
      console.log(`No FCM token found for user ${userId}`);
      return;
    }

    await admin.messaging().send({
      token: fcmToken.token,
      notification: {
        title,
        body,
      },
    });

    console.log(`✅ Notification sent to user ${userId}`);
  } catch (err) {
    console.error("❌ Failed to send notification:", err.message);
  }
};

// Process Outbox Event
const processEvent = async (event) => {
  const payload = JSON.parse(event.payload);

  if (event.eventType !== "ENROLLMENT_CREATED") return;

  // Fetch Course
  const course = await prisma.course.findUnique({
    where: { id: payload.courseId },
    select: {
      title: true,
      instructorId: true,
    },
  });

  const courseTitle = course?.title || "your course";

  // Student Notification
  await sendFcmNotification(
    payload.studentId,
    "Welcome Aboard! 🚀",
    `Your enrollment in "${courseTitle}" has been confirmed.`
  );

  // Instructor Notification
  if (course?.instructorId) {
    await sendFcmNotification(
      course.instructorId,
      "New Enrollment 🎉",
      `A student enrolled in "${courseTitle}".`
    );
  }

  // Chatbot Notification
  try {
    await fetch(
      `${process.env.CHATBOT_SERVICE_URL || "http://chatbot-service:5003"}/api/enroll`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("✅ Chatbot notified");
  } catch (err) {
    console.error("❌ Chatbot Error:", err.message);
  }
};

// Poll Outbox Table
const pollOutbox = async () => {
  if (isRunning) return;

  isRunning = true;

  try {
    const events = await prisma.outboxEvent.findMany({
      where: {
        status: {
          in: ["PENDING", "FAILED"],
        },
        attempts: {
          lt: 5,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 5,
    });

    for (const event of events) {
      try {
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            attempts: event.attempts + 1,
          },
        });

        await processEvent(event);

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: "PROCESSED",
          },
        });

        console.log(`✅ Event ${event.id} processed`);
      } catch (err) {
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: "FAILED",
            lastError: err.message,
          },
        });

        console.error(`❌ Event ${event.id} failed`);
      }
    }
  } finally {
    isRunning = false;
  }
};

// Start Worker
export const startOutboxWorker = () => {
  console.log("🚀 Outbox Worker Started");
  setInterval(pollOutbox, 10000);
};