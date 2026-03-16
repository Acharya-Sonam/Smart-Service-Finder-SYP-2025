import dotenv from "dotenv";
dotenv.config({ path: new URL("./.env", import.meta.url).pathname });

import express from "express";
import cors from "cors";

import UserModel    from "./models/user.js";
import ServiceModel from "./models/Service.js";
import BookingModel from "./models/Booking.js";
import ReviewModel  from "./models/Review.js";

import authRoutes      from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import serviceRoutes   from "./routes/service.routes.js";
import bookingRoutes   from "./routes/booking.routes.js";
import reviewRoutes    from "./routes/review.routes.js";
import adminRoutes     from "./routes/admin.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

await UserModel.createTable();
await ServiceModel.createTable();
await BookingModel.createTable();
await ReviewModel.createTable();

app.use("/api/auth",     authRoutes);
app.use("/api",          protectedRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews",  reviewRoutes);
app.use("/api/admin",    adminRoutes);

app.get("/", (req, res) => res.json({ status: "SmartService API is running" }));

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
