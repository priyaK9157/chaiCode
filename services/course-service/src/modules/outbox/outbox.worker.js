import prisma from "../../config/db.js";

let isRunning = false;

const processEvent = async (event) => {
  const payload = JSON.parse(event.payload);
  console.log(`⚙️ [Outbox Worker] Processing event: ${event.eventType} (ID: ${event.id})`);

  if (event.eventType === "ENROLLMENT_CREATED") {
    // 1. Mock sending confirmation email
    console.log(`✉️ [Outbox Worker] Send confirmation email to Student ${payload.studentId} for Course ${payload.courseId}`);

    // 2. Notify Chatbot Service
    const chatbotUrl = `${process.env.CHATBOT_SERVICE_URL || 'http://chatbot-service:5003'}/api/enroll`;
    try {
      console.log(`🔗 [Outbox Worker] Notifying Chatbot Service at: ${chatbotUrl}`);
      const response = await fetch(chatbotUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      // Note: If chatbot-service endpoint does not exist yet, this may return 404 or fail.
      // This is expected and demonstrates the outbox retry resilience!
      if (!response.ok) {
        throw new Error(`Chatbot Service responded with status: ${response.status}`);
      }
      console.log(`✅ [Outbox Worker] Chatbot Service notified successfully`);
    } catch (err) {
      console.error(`⚠️ [Outbox Worker] Chatbot notification failed: ${err.message}`);
      // Throw the error so the worker retries this event in the next cycle
      throw err;
    }
  }
};

const pollOutbox = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const events = await prisma.outboxEvent.findMany({
      where: {
        status: { in: ["PENDING", "FAILED"] },
        attempts: { lt: 5 }, // Retry up to 5 times
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    for (const event of events) {
      try {
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { attempts: event.attempts + 1 },
        });

        await processEvent(event);

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: "PROCESSED" },
        });
        console.log(`✅ [Outbox Worker] Event ${event.id} marked as PROCESSED`);
      } catch (err) {
        console.error(`❌ [Outbox Worker] Event ${event.id} failed to process:`, err.message);
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: "FAILED",
            lastError: err.message,
          },
        });
      }
    }
  } catch (err) {
    console.error("❌ [Outbox Worker] Polling error:", err.message);
  } finally {
    isRunning = false;
  }
};

export const startOutboxWorker = () => {
  console.log("🚀 [Outbox Worker] Transactional Outbox Background Worker started");
  // Poll every 10 seconds
  setInterval(pollOutbox, 10000);
};
