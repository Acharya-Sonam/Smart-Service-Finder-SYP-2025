import { Router } from "express";
import db from "../database.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

/* GET MESSAGES BY BOOKING */
router.get("/:bookingId", verifyToken, async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT m.id, m.sender_id AS senderId, m.message,
             m.created_at AS createdAt, u.fullName AS senderName
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.booking_id = ?
      ORDER BY m.created_at ASC
    `, [req.params.bookingId]);

    res.json(rows);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }
});


/* SEND MESSAGE */
router.post("/", verifyToken, async (req, res) => {
  try {

    const { bookingId, receiverId, message } = req.body;

    const [result] = await db.query(
      "INSERT INTO messages (booking_id, sender_id, receiver_id, message) VALUES (?,?,?,?)",
      [bookingId, req.user.id, receiverId, message]
    );

    res.status(201).json({ messageId: result.insertId });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }
});

export default router;