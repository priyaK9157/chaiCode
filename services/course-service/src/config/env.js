import dotenv from "dotenv";
dotenv.config();

// export default {
//   PORT: process.env.PORT || 5000,
//   JWT_SECRET: process.env.JWT_SECRET,
//   DATABASE_URL: process.env.DATABASE_URL,
//   STRIPE_SECRET: process.env.STRIPE_SECRET
// };


export default {
  PORT: process.env.PORT || 5002,
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
  DATABASE_URL: process.env.DATABASE_URL,
  STRIPE_SECRET: process.env.STRIPE_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000"
};
