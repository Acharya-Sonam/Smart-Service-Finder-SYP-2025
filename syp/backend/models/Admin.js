import db from "../database.js";

const AdminModel = {

  async getStats() {
    const [[{ total_users }]] = await db.query(
      "SELECT COUNT(*) AS total_users FROM users"
    );
    const [[{ total_customers }]] = await db.query(
      "SELECT COUNT(*) AS total_customers FROM users WHERE role = 'Customer'"
    );
    const [[{ total_providers }]] = await db.query(
      "SELECT COUNT(*) AS total_providers FROM users WHERE role = 'Service Provider'"
    );
    const [[{ total_services }]] = await db.query(
      "SELECT COUNT(*) AS total_services FROM services"
    );
    const [[{ total_bookings }]] = await db.query(
      "SELECT COUNT(*) AS total_bookings FROM bookings"
    );
    const [[{ pending_bookings }]] = await db.query(
      "SELECT COUNT(*) AS pending_bookings FROM bookings WHERE status = 'pending'"
    );
    const [[{ total_reviews }]] = await db.query(
      "SELECT COUNT(*) AS total_reviews FROM reviews"
    );

    return {
      total_users,
      total_customers,
      total_providers,
      total_services,
      total_bookings,
      pending_bookings,
      total_reviews,
    };
  },

  async getAllUsers() {
    const [rows] = await db.query(
      "SELECT id, fullName, email, contact, location, role, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  },

  async getUserById(id) {
    const [rows] = await db.query(
      "SELECT id, fullName, email, contact, location, role, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  async deleteUser(id) {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows;
  },

  async getAllServices() {
    const [rows] = await db.query(
      `SELECT s.*, u.fullName AS provider_name
       FROM services s
       JOIN users u ON u.id = s.provider_id
       ORDER BY s.created_at DESC`
    );
    return rows;
  },

  async deleteService(id) {
    const [result] = await db.query("DELETE FROM services WHERE id = ?", [id]);
    return result.affectedRows;
  },

  async toggleService(id, is_active) {
    const [result] = await db.query(
      "UPDATE services SET is_active = ? WHERE id = ?",
      [is_active, id]
    );
    return result.affectedRows;
  },

  async getAllBookings() {
    const [rows] = await db.query(
      `SELECT b.*,
              s.title AS service_title,
              c.fullName AS customer_name,
              p.fullName AS provider_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users c ON c.id = b.customer_id
       JOIN users p ON p.id = b.provider_id
       ORDER BY b.created_at DESC`
    );
    return rows;
  },

  async getAllReviews() {
    const [rows] = await db.query(
      `SELECT r.*, u.fullName AS customer_name, p.fullName AS provider_name
       FROM reviews r
       JOIN users u ON u.id = r.customer_id
       JOIN users p ON p.id = r.provider_id
       ORDER BY r.created_at DESC`
    );
    return rows;
  },

  async deleteReview(id) {
    const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows;
  },

  async getRecentActivity() {
    const [rows] = await db.query(
      `SELECT b.id, b.status, b.created_at,
              c.fullName AS customer_name,
              p.fullName AS provider_name,
              s.title AS service_title
       FROM bookings b
       JOIN users c ON c.id = b.customer_id
       JOIN users p ON p.id = b.provider_id
       JOIN services s ON s.id = b.service_id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );
    return rows;
  },
};

export default AdminModel;
