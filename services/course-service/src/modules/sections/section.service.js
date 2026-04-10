import prisma from "../../config/db.js";

export const createSection = (data) => {
  return prisma.section.create({
    data
  });
};

export const updateSection = (id, data) => {
  return prisma.section.update({
    where: { id },
    data
  });
};

export const deleteSection = (id) => {
  return prisma.section.delete({
    where: { id }
  });
};

export const getSectionById = (id) => {
  return prisma.section.findUnique({
    where: { id },
    include: {
      course: true
    }
  });
};
