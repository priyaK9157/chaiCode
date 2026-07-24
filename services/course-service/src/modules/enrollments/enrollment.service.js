import prisma from "../../config/db.js";

export const createEnrollment = async (studentId, courseId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the enrollment record
    const enrollment = await tx.enrollment.create({
      data: {
        studentId,
        courseId,
        status: "COMPLETED",
      },
    });

    // 2. Create the outbox event record atomically
    await tx.outboxEvent.create({
      data: {
        eventType: "ENROLLMENT_CREATED",
        payload: JSON.stringify({
          enrollmentId: enrollment.id,
          studentId,
          courseId,
          status: "COMPLETED",
          createdAt: enrollment.createdAt,
        }),
      },
    });

    console.log(`📦 [Transactional Outbox] Queued ENROLLMENT_CREATED event for student: ${studentId}, course: ${courseId}`);
    return enrollment;
  });
};

export const checkEnrollment = async (studentId, courseId) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      status: "COMPLETED",
    },
  });

  return !!enrollment;
};
