import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/admin/dashboard",
  verifyToken,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard", user: req.user });
  }
);

router.get(
  "/provider/dashboard",
  verifyToken,
  authorizeRoles("Service Provider"),
  (req, res) => {
    res.json({ message: "Welcome to Service Provider Dashboard", user: req.user });
  }
);

router.get(
  "/customer/dashboard",
  verifyToken,
  authorizeRoles("Customer"),
  (req, res) => {
    res.json({ message: "Welcome to Customer Dashboard", user: req.user });
  }
);

router.get(
  "/services/manage",
  verifyToken,
  authorizeRoles("Admin", "Service Provider"),
  (req, res) => {
    res.json({ message: "Service management panel", user: req.user });
  }
);

export default router;