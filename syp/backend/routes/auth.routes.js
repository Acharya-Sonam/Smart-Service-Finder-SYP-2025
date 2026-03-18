import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import db from "../database.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, contact, location, role } = req.body;
    const clean = email.toLowerCase().trim();
    const [exists] = await db.query("SELECT id FROM users WHERE email = ?", [clean]);
    if (exists.length) return res.status(400).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (fullName, email, password, contact, location, role) VALUES (?,?,?,?,?,?)",
      [fullName, clean, hashed, contact, location, role]
    );
    res.status(201).json({ message: "Account created. Please sign in." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const clean = email.toLowerCase().trim();
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = ?", [clean, role]
    );
    if (!rows.length) return res.status(401).json({ message: "Invalid username or password" });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ message: "Invalid username or password" });
    const token = jwt.sign(
      { id: rows[0].id, email: rows[0].email, role: rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    const { password: _, ...safeUser } = rows[0];
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const clean = email.toLowerCase().trim();
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [clean]);
    if (!rows.length) return res.status(404).json({ message: "Email not found" });
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);
    await db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expires, clean]
    );
    const resetUrl = "http://localhost:5173/reset-password/" + token;
    await mailer.sendMail({
      from: "Servify <" + process.env.EMAIL_USER + ">",
      to: email,
      subject: "Reset your Servify password",
      html: "<p>Click <a href='" + resetUrl + "'>here</a> to reset your password. Expires in 1 hour.</p>",
    });
    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const [rows] = await db.query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()", [token]
    );
    if (!rows.length) return res.status(400).json({ message: "Token expired or invalid" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [hashed, rows[0].id]
    );
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { fullName, contact, location } = req.body;
    await db.query(
      "UPDATE users SET fullName = ?, contact = ?, location = ? WHERE id = ?",
      [fullName, contact, location, req.user.id]
    );
    const [rows] = await db.query(
      "SELECT id, fullName, email, contact, location, role FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
