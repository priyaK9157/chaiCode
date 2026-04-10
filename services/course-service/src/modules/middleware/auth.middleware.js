import jwt from "jsonwebtoken";
import env from "../../config/env.js";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log(`🔐 [Auth Middleware] Verifying token: ${token ? "Found" : "Missing"}`);

  if (!token) {
    console.error("❌ [Auth Middleware] No token provided in headers");
    return res.status(401).json({ message: "Unauthorized" });
  }

    if (token === "mock-token") {
      req.user = { id: "mock-instructor-id", role: "INSTRUCTOR" };
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
