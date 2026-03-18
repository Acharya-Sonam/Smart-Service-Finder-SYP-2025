import { Router } from "express";
import db from "../database.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { bookingId, lat, lng } = req.body;
    const [rows] = await db.query(
      "SELECT customer_id FROM bookings WHERE id = ? AND provider_id = ? AND status = 'accepted'",
      [bookingId, req.user.id]
    );
    if (!rows.length) return res.status(403).json({ message: "Not allowed" });
    await db.query(
      "INSERT INTO provider_locations (provider_id, booking_id, lat, lng) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE lat = ?, lng = ?, updated_at = CURRENT_TIMESTAMP",
      [req.user.id, bookingId, lat, lng, lat, lng]
    );
    req.io.to("user_" + rows[0].customer_id).emit("location_update", {
      bookingId, lat, lng, timestamp: new Date().toISOString()
    });
    res.json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:bookingId", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT lat, lng, updated_at FROM provider_locations WHERE booking_id = ?",
      [req.params.bookingId]
    );
    res.json({ location: rows[0] || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
