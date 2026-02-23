import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import UserModel from "./models/user.js";
import authRoutes from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

await UserModel.createTable();

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

app.get("/", (req, res) => res.json({ status: "SmartService API is running" }));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});