import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

console.log("Database URL:", process.env.DATABASE_URL);
const prisma = new PrismaClient();

async function check() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to database!");

    // Run raw SQL to list tables in public and course schemas
    const tables = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'course') 
      ORDER BY table_schema, table_name;
    `;
    console.log("Tables found in database:");
    console.table(tables);

    // Try to query Course table
    try {
      const courses = await prisma.course.findMany();
      console.log(`Successfully queried Course table. Count: ${courses.length}`);
    } catch (e) {
      console.error("Failed to query Course table:", e.message);
    }
  } catch (err) {
    console.error("Database connection/query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
