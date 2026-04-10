import prisma from "../../config/db.js";

export const createLesson = (data) => {
  return prisma.lesson.create({
    data
  });
};

export const updateLesson = (id, data) => {
  return prisma.lesson.update({
    where: { id },
    data
  });
};

export const deleteLesson = (id) => {
  return prisma.lesson.delete({
    where: { id }
  });
};

export const getLessonById = (id) => {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      section: {
        include: {
          course: true
        }
      }
    }
  });
};
