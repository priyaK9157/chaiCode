import prisma from "../../config/db.js";

export const createEnrollment = async (studentId, courseId) => {
  return await prisma.enrollment.create({
    data: {
      studentId,
      courseId,
      status: "COMPLETED",
    },
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
