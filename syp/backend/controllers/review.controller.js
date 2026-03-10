import ReviewModel from "../models/Review.js";
import BookingModel from "../models/Booking.js";

export const createReview = async (req, res) => {
  const { booking_id, rating, comment } = req.body;

  if (!booking_id || !rating) {
    return res.status(400).json({ message: "booking_id and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const booking = await BookingModel.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({ message: "You can only review your own bookings" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only review a completed booking" });
    }

    const existing = await ReviewModel.findByBookingId(booking_id);
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    const insertId = await ReviewModel.create({
      booking_id,
      customer_id: req.user.id,
      provider_id: booking.provider_id,
      rating,
      comment,
    });

    return res.status(201).json({ message: "Review submitted successfully", reviewId: insertId });
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.findByProvider(req.params.providerId);
    const ratingInfo = await ReviewModel.getAverageRating(req.params.providerId);

    return res.status(200).json({
      avg_rating: ratingInfo.avg_rating || 0,
      total_reviews: ratingInfo.total,
      reviews,
    });
  } catch (err) {
    console.error("getProviderReviews error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
