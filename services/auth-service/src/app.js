import express from "express";
import cors from "cors";
import routes from "./modules/routes.js"
import errorMiddleware from "./modules/middleware/error.middleware.js";

const app = express();

app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
