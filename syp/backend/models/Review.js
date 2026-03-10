import db from "../database.js";

const ReviewModel = {
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await db.query(sql);
  },

  async create({ booking_id, customer_id, provider_id, rating, comment }) {
    const [result] = await db.query(
      `INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, customer_id, provider_id, rating, comment || null]
    );
    return result.insertId;
  },

  async findByBookingId(booking_id) {
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE booking_id = ?",
      [booking_id]
    );
    return rows[0] || null;
  },

  async findByProvider(provider_id) {
    const [rows] = await db.query(
      `SELECT r.*, u.fullName AS customer_name
       FROM reviews r
       JOIN users u ON u.id = r.customer_id
       WHERE r.provider_id = ?
       ORDER BY r.created_at DESC`,
      [provider_id]
    );
    return rows;
  },

  async getAverageRating(provider_id) {
    const [rows] = await db.query(
      "SELECT ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS total FROM reviews WHERE provider_id = ?",
      [provider_id]
    );
    return rows[0];
  },
};

export default ReviewModel;
