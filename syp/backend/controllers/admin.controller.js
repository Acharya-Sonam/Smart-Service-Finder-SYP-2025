import AdminModel from "../models/Admin.js";

export const getStats = async (req, res) => {
  try {
    const stats = await AdminModel.getStats();
    return res.status(200).json({ stats });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const activity = await AdminModel.getRecentActivity();
    return res.status(200).json({ activity });
  } catch (err) {
    console.error("getRecentActivity error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await AdminModel.getAllUsers();
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await AdminModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const affected = await AdminModel.deleteUser(req.params.id);
    if (!affected) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await AdminModel.getAllServices();
    return res.status(200).json({ count: services.length, services });
  } catch (err) {
    console.error("getAllServices error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const affected = await AdminModel.deleteService(req.params.id);
    if (!affected) return res.status(404).json({ message: "Service not found" });
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleService = async (req, res) => {
  try {
    const { is_active } = req.body;
    if (is_active === undefined) {
      return res.status(400).json({ message: "is_active is required" });
    }
    const affected = await AdminModel.toggleService(req.params.id, is_active);
    if (!affected) return res.status(404).json({ message: "Service not found" });
    return res.status(200).json({
      message: is_active ? "Service activated" : "Service deactivated",
    });
  } catch (err) {
    console.error("toggleService error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await AdminModel.getAllBookings();
    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("getAllBookings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await AdminModel.getAllReviews();
    return res.status(200).json({ count: reviews.length, reviews });
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const affected = await AdminModel.deleteReview(req.params.id);
    if (!affected) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
