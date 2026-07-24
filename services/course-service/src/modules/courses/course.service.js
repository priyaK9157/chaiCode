import prisma from "../../config/db.js";
import redis from "../../config/redis.js";

// Helper to evict cache keys upon course changes
const clearCourseCache = async (courseId) => {
  try {
    console.log(`🧹 [Cache Eviction] Clearing keys for course ID: ${courseId || 'all'}`);
    await redis.del("courses:all");
    if (courseId) {
      await redis.del(`courses:${courseId}`);
    }
  } catch (err) {
    console.error("⚠️ [Cache Eviction] Failed to clear Redis cache:", err.message);
  }
};

export const createCourse = async (data, instructorId) => {
  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price ? parseFloat(data.price) : 0,
      isPublished: data.isPublished === "true" || data.isPublished === true,
      thumbnailUrl: data.thumbnailUrl || null,
      instructorId
    }
  });
  await clearCourseCache();
  return course;
};

export const getCourses = async () => {
  const cacheKey = "courses:all";
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("⚡ [Redis] Cache HIT for all courses");
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("⚠️ [Redis] Error reading courses:all cache:", err.message);
  }

  console.log("🛢️ [Database] Cache MISS. Querying PostgreSQL for all courses");
  const courses = await prisma.course.findMany({
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

  try {
    await redis.setex(cacheKey, 3600, JSON.stringify(courses)); // Cache for 1 hour
  } catch (err) {
    console.error("⚠️ [Redis] Error setting courses:all cache:", err.message);
  }
  return courses;
};

export const getCourseById = async (id) => {
  const cacheKey = `courses:${id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`⚡ [Redis] Cache HIT for course: ${id}`);
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error(`⚠️ [Redis] Error reading courses:${id} cache:`, err.message);
  }

  console.log(`🛢️ [Database] Cache MISS. Querying PostgreSQL for course: ${id}`);
  const course = await prisma.course.findUnique({
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

  if (course) {
    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(course));
    } catch (err) {
      console.error(`⚠️ [Redis] Error setting courses:${id} cache:`, err.message);
    }
  }
  return course;
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

export const updateCourse = async (id, data) => {
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished === "true" || data.isPublished === true;
  if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;

  const course = await prisma.course.update({
    where: { id },
    data: updateData
  });
  await clearCourseCache(id);
  return course;
};

export const deleteCourse = async (id) => {
  // Delete related records first
  await prisma.lesson.deleteMany({
    where: { section: { courseId: id } }
  });
  await prisma.section.deleteMany({ where: { courseId: id } });
  await prisma.enrollment.deleteMany({ where: { courseId: id } });
  const course = await prisma.course.delete({ where: { id } });
  await clearCourseCache(id);
  return course;
};

export const getEnrolledCourses = async (studentId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: "COMPLETED",
    },
    include: {
      course: {
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
      }
    }
  });
  return enrollments.map((e) => e.course);
};
