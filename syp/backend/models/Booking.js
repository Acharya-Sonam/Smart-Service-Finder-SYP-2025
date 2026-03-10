import db from "../database.js";

const BookingModel = {
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        service_id INT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        notes TEXT,
        status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `;
    await db.query(sql);
  },

  async create({ customer_id, provider_id, service_id, booking_date, booking_time, notes }) {
    const [result] = await db.query(
      `INSERT INTO bookings (customer_id, provider_id, service_id, booking_date, booking_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_id, provider_id, service_id, booking_date, booking_time, notes || null]
    );
    return result.insertId;
  },

  async countActive(customer_id) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count FROM bookings
       WHERE customer_id = ? AND status IN ('pending', 'accepted')`,
      [customer_id]
    );
    return rows[0].count;
  },

  async findById(id) {
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
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCustomer(customer_id) {
    const [rows] = await db.query(
      `SELECT b.*, s.title AS service_title, s.price AS service_price, u.fullName AS provider_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users u ON u.id = b.provider_id
       WHERE b.customer_id = ?
       ORDER BY b.booking_date DESC`,
      [customer_id]
    );
    return rows;
  },

  async findByProvider(provider_id) {
    const [rows] = await db.query(
      `SELECT b.*, s.title AS service_title, u.fullName AS customer_name, u.contact AS customer_contact
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users u ON u.id = b.customer_id
       WHERE b.provider_id = ?
       ORDER BY b.booking_date DESC`,
      [provider_id]
    );
    return rows;
  },

  async updateStatus(id, status) {
    const [result] = await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, id]
    );
    return result.affectedRows;
  },
};

export default BookingModel;
