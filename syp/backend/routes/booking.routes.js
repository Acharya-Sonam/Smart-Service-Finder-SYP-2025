import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, authorizeRoles("Customer"), createBooking);
router.get("/my", verifyToken, authorizeRoles("Customer"), getMyBookings);
router.get("/provider", verifyToken, authorizeRoles("Service Provider"), getProviderBookings);
router.get("/:id", verifyToken, authorizeRoles("Customer", "Service Provider"), getBookingById);
router.patch("/:id/status", verifyToken, authorizeRoles("Customer", "Service Provider"), updateBookingStatus);

export default router;
