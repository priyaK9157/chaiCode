import jwt from "jsonwebtoken";
// import env from "../../config/env";
import env from "../../config/env.js"

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
