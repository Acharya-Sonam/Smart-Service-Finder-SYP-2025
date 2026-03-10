import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import UserModel from "../models/user.js";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
};

// ── Signup ──
export const signup = async (req, res) => {
  const { fullName, email, password, contact, location, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: "fullName, email, password, and role are required" });
  }

  const validRoles = ["Admin", "Service Provider", "Customer"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${validRoles.join(", ")}` });
  }

  try {
    const existing = await UserModel.findByEmail(email);
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    // Hash password correctly
    const hashedPassword = await bcrypt.hash(password, 12);

    const insertId = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
      contact: contact || null,
      location: location || null,
      role,
    });

    return res.status(201).json({
      message: "Account created successfully",
      userId: insertId,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── Login ──
export const login = async (req, res) => {
  let { email, password, role } = req.body;
  email = email.trim();
  password = password.trim();

  if (!email || !password || !role) {
    return res.status(400).json({ message: "email, password, and role are required" });
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    if (user.role !== role) {
      return res.status(403).json({ message: `No ${role} account found with this email` });
    }

    // ✅ Correct bcrypt comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        contact: user.contact,
        location: user.location,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── Get current user ──
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── Forgot Password ──
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await UserModel.findByEmail(email);
   if (user.role.toLowerCase() !== role.trim().toLowerCase()) {
  return res.status(403).json({ message: `No ${role} account found with this email` });
}
    // Generate temporary reset token
    const resetToken = Math.random().toString(36).substring(2, 12); // random 10 chars
    const expires = Date.now() + 3600 * 1000; // 1 hour

    // Save token to DB
    await UserModel.saveResetToken(user.id, resetToken, expires);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SmartService Password Reset",
      html: `
        <p>Hello ${user.fullName},</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="http://localhost:5173/reset-password?token=${resetToken}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};