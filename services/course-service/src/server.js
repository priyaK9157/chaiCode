import app from "./app.js";
import env from "./config/env.js";
import prisma from "./config/db.js"; // 1. Use the named import with curly braces

// Register global error safety nets to prevent Node from crashing on unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

async function startServer() {
  try {
    // 2. Prisma uses $connect() to check the database, NOT .query()
    await prisma.$connect(); 
    console.log("Database connected successfully ✅");

    app.listen(env.PORT || 5000, () => {
      console.log(`Server running on port ${env.PORT || 5000}`);
    });

  } catch (error) {
    console.error("Database connection failed ❌", error);
    // 3. Cleanly disconnect if the connection fails
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();