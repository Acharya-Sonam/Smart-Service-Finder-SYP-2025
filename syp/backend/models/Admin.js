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
    const [[{ completed_bookings }]] = await db.query(
      "SELECT COUNT(*) AS completed_bookings FROM bookings WHERE status = 'completed'"
    );
    const [[{ total_reviews }]] = await db.query(
      "SELECT COUNT(*) AS total_reviews FROM reviews"
    );
    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(s.price), 0) AS total_revenue FROM bookings b JOIN services s ON s.id = b.service_id WHERE b.status = 'completed'"
    );

    return {
      total_users,
      total_customers,
      total_providers,
      total_services,
      total_bookings,
      pending_bookings,
      completed_bookings,
      total_reviews,
      total_revenue
    };
  },

  async getRevenueStats() {
    const [daily] = await db.query(`
      SELECT DATE(b.booking_date) as date, COUNT(*) as bookings, COALESCE(SUM(s.price), 0) as revenue
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.status = 'completed' AND b.booking_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(b.booking_date)
      ORDER BY date DESC
    `);
    
    const [monthly] = await db.query(`
      SELECT DATE_FORMAT(b.booking_date, '%Y-%m') as month, COUNT(*) as bookings, COALESCE(SUM(s.price), 0) as revenue
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.status = 'completed'
      GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    
    return { daily, monthly };
  },

  async getAllUsers() {
    const [rows] = await db.query(
      "SELECT id, fullName, email, contact, location, role, created_at, (SELECT COUNT(*) FROM bookings WHERE customer_id = users.id) as total_bookings FROM users ORDER BY created_at DESC"
    );
    return rows;
  },

  async getUserById(id) {
    const [rows] = await db.query(
      `SELECT u.id, u.fullName, u.email, u.contact, u.location, u.role, u.created_at,
              (SELECT COUNT(*) FROM bookings WHERE customer_id = u.id) as customer_bookings,
              (SELECT COUNT(*) FROM services WHERE provider_id = u.id) as provider_services,
              (SELECT COUNT(*) FROM bookings WHERE provider_id = u.id) as provider_bookings,
              (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE provider_id = u.id) as avg_rating
       FROM users u WHERE u.id = ?`,
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
      `SELECT s.*, u.fullName AS provider_name,
              (SELECT COUNT(*) FROM bookings WHERE service_id = s.id) as total_bookings,
              (SELECT ROUND(AVG(r.rating), 1) FROM reviews r JOIN bookings b ON b.id = r.booking_id WHERE b.service_id = s.id) as avg_rating
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
              s.price AS service_price,
              c.fullName AS customer_name,
              c.contact AS customer_contact,
              p.fullName AS provider_name,
              p.contact AS provider_contact
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
      `SELECT r.*, 
              u.fullName AS customer_name,
              p.fullName AS provider_name,
              s.title AS service_title
       FROM reviews r
       JOIN users u ON u.id = r.customer_id
       JOIN users p ON p.id = r.provider_id
       JOIN bookings b ON b.id = r.booking_id
       JOIN services s ON s.id = b.service_id
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
      `SELECT 'booking' as type, id, status, created_at,
              CONCAT(c.fullName, ' booked ', s.title, ' from ', p.fullName) as description
       FROM bookings b
       JOIN users c ON c.id = b.customer_id
       JOIN users p ON p.id = b.provider_id
       JOIN services s ON s.id = b.service_id
       UNION ALL
       SELECT 'user' as type, id, role as status, created_at,
              CONCAT(fullName, ' registered as ', role) as description
       FROM users
       UNION ALL
       SELECT 'review' as type, r.id, rating as status, r.created_at,
              CONCAT(u.fullName, ' reviewed ', p.fullName, ': ', r.rating, ' stars') as description
       FROM reviews r
       JOIN users u ON u.id = r.customer_id
       JOIN users p ON p.id = r.provider_id
       ORDER BY created_at DESC
       LIMIT 20`
    );
    return rows;
  },

  async getSystemLogs() {
    const [rows] = await db.query(
      `SELECT * FROM (
          SELECT 'booking' as type, id, status, created_at, 'System' as level
          FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          UNION ALL
          SELECT 'user' as type, id, role, created_at, 'System' as level
          FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ) as logs
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return rows;
  },

  async getProviderLocations() {
    const [rows] = await db.query(
      `SELECT pl.*, u.fullName as provider_name, 
              b.customer_id, c.fullName as customer_name,
              s.title as service_title
       FROM provider_locations pl
       JOIN users u ON u.id = pl.provider_id
       JOIN bookings b ON b.id = pl.booking_id
       JOIN users c ON c.id = b.customer_id
       JOIN services s ON s.id = b.service_id
       WHERE pl.updated_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY pl.updated_at DESC`
    );
    return rows;
  },
};

export default AdminModel;