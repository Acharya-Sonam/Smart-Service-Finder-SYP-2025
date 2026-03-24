import BookingModel from "../models/Booking.js";
import ServiceModel from "../models/Service.js";

export const createBooking = async (req, res) => {
  const { service_id, booking_date, booking_time, notes } = req.body;

  if (!service_id || !booking_date || !booking_time) {
    return res.status(400).json({ message: "service_id, booking_date, and booking_time are required" });
  }

  try {
    const service = await ServiceModel.findById(service_id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const activeCount = await BookingModel.countActive(req.user.id);
    if (activeCount >= 5) {
      return res.status(400).json({ message: "You cannot have more than 5 active bookings at a time" });
    }

 const insertId = await BookingModel.create({
  customer_id: req.user.id,
  provider_id: service.providerId || service.provider_id,
  service_id: service_id,
  booking_date: booking_date,
  booking_time: booking_time,
  notes: notes || "",
});

    return res.status(201).json({ message: "Booking request sent successfully", bookingId: insertId });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    console.log("USER DATA:", req.user); 

    const bookings = await BookingModel.findByCustomer(req.user.id);

    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.findByProvider(req.user.id);
    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("getProviderBookings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.customer_id !== req.user.id && booking.provider_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    return res.status(200).json({ booking });
  } catch (err) {
    console.error("getBookingById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role === "Service Provider") {
      if (booking.provider_id !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own bookings" });
      }
      const allowed = ["accepted", "rejected", "completed"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Provider can only set: accepted, rejected, completed" });
      }
    }

    if (req.user.role === "Customer") {
      if (booking.customer_id !== req.user.id) {
        return res.status(403).json({ message: "You can only cancel your own bookings" });
      }
      if (status !== "cancelled") {
        return res.status(400).json({ message: "Customers can only cancel bookings" });
      }
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
      const hoursUntil = (bookingDateTime - new Date()) / (1000 * 60 * 60);
      if (hoursUntil < 24) {
        return res.status(400).json({ message: "Cancellation must be made at least 24 hours before the appointment" });
      }
    }

    await BookingModel.updateStatus(req.params.id, status);
    return res.status(200).json({ message: `Booking ${status} successfully` });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
