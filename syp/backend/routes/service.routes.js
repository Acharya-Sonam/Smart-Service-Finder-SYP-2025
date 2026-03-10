import { Router } from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  getMyServices,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllServices);
router.get("/my", verifyToken, authorizeRoles("Service Provider"), getMyServices);
router.get("/:id", getServiceById);
router.post("/", verifyToken, authorizeRoles("Service Provider"), createService);
router.put("/:id", verifyToken, authorizeRoles("Service Provider"), updateService);
router.delete("/:id", verifyToken, authorizeRoles("Service Provider"), deleteService);

export default router;
