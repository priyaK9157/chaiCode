import dotenv from "dotenv";
dotenv.config();

// export default {
//   PORT: process.env.PORT || 5000,
//   JWT_SECRET: process.env.JWT_SECRET,
//   DATABASE_URL: process.env.DATABASE_URL,
//   STRIPE_SECRET: process.env.STRIPE_SECRET
// };


export default {
  PORT: process.env.PORT || 5001,
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
  DATABASE_URL: process.env.DATABASE_URL
};
