import db from "../database.js";

const ServiceModel = {
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        location VARCHAR(200),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await db.query(sql);
  },

  async create({ provider_id, title, description, category, price, location }) {
    const [result] = await db.query(
      `INSERT INTO services (provider_id, title, description, category, price, location)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [provider_id, title, description || "", category, price, location || null]
    );
    return result.insertId;
  },

  async findAll({ category, min_price, max_price, location } = {}) {
    let sql = `
      SELECT s.*, u.fullName AS provider_name, u.contact AS provider_contact
      FROM services s
      JOIN users u ON u.id = s.provider_id
      WHERE s.is_active = 1
    `;
    const params = [];

    if (category) {
      sql += " AND s.category = ?";
      params.push(category);
    }
    if (min_price) {
      sql += " AND s.price >= ?";
      params.push(min_price);
    }
    if (max_price) {
      sql += " AND s.price <= ?";
      params.push(max_price);
    }
    if (location) {
      sql += " AND s.location LIKE ?";
      params.push(`%${location}%`);
    }

    sql += " ORDER BY s.created_at DESC";
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT s.*, u.fullName AS provider_name, u.contact AS provider_contact
       FROM services s
       JOIN users u ON u.id = s.provider_id
       WHERE s.id = ? AND s.is_active = 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByProviderId(provider_id) {
    const [rows] = await db.query(
      "SELECT * FROM services WHERE provider_id = ? ORDER BY created_at DESC",
      [provider_id]
    );
    return rows;
  },

  async update(id, { title, description, category, price, location, is_active }) {
    const [result] = await db.query(
      `UPDATE services SET title = ?, description = ?, category = ?, price = ?, location = ?, is_active = ?
       WHERE id = ?`,
      [title, description, category, price, location, is_active, id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM services WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

export default ServiceModel;
