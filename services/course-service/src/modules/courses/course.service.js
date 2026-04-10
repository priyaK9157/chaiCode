import prisma from "../../config/db.js";

export const createCourse = (data, instructorId) => {
  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price ? parseFloat(data.price) : 0,
      isPublished: data.isPublished === "true" || data.isPublished === true,
      thumbnailUrl: data.thumbnailUrl || null,
      instructorId
    }
  });
};

export const getCourses = () => {
  return prisma.course.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnailUrl: true,
      isPublished: true,
      instructorId: true,
      createdAt: true
    }
  });
};

export const getCourseById = (id) => {
  return prisma.course.findUnique({
    where: { id: id.toString() },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      thumbnailUrl: true,
      isPublished: true,
      instructorId: true,
      createdAt: true,
      sections: {
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            select: {
              id: true,
              title: true,
              order: true
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });
};
export const getInstructorCourses = (instructorId) => {
  return prisma.course.findMany({
    where: { instructorId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      isPublished: true,
      createdAt: true
    }
  });
};

export const updateCourse = (id, data) => {
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished === "true" || data.isPublished === true;
  if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;

  return prisma.course.update({
    where: { id },
    data: updateData
  });
};

export const deleteCourse = async (id) => {
  // Delete related records first
  await prisma.lesson.deleteMany({
    where: { section: { courseId: id } }
  });
  await prisma.section.deleteMany({ where: { courseId: id } });
  await prisma.enrollment.deleteMany({ where: { courseId: id } });
  return prisma.course.delete({ where: { id } });
};
