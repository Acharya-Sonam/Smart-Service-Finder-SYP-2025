import express        from "express";
import cors           from "cors";
import dotenv         from "dotenv";
import http           from "http";
import { Server }     from "socket.io";

import authRoutes     from "./routes/auth.routes.js";
import bookingRoutes  from "./routes/booking.routes.js";   // your friend's
import reviewRoutes   from "./routes/review.routes.js";    // your friend's
import serviceRoutes  from "./routes/service.routes.js";   // your friend's
import chatRoutes     from "./routes/chat.routes.js";
import notifRoutes    from "./routes/notification.routes.js";
import locationRoutes from "./routes/location.routes.js";

dotenv.config();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Attach io to every request so routes can emit events
app.use((req, _res, next) => { req.io = io; next(); });

// ── Routes ────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/bookings",      bookingRoutes);
app.use("/api/reviews",       reviewRoutes);
app.use("/api/services",      serviceRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/notifications", notifRoutes);
app.use("/api/location",      locationRoutes);

// ── Socket.IO events ──────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Each user joins their own private room on login
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
  });

  // Chat — forward message to receiver
  socket.on("send_message", (data) => {
    // data: { senderId, receiverId, bookingId, message, senderName }
    io.to(`user_${data.receiverId}`).emit("receive_message", data);
  });

  // Location — provider emits this, customer receives location_update
  socket.on("provider_location", (data) => {
    // data: { providerId, customerId, bookingId, lat, lng }
    io.to(`user_${data.customerId}`).emit("location_update", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
