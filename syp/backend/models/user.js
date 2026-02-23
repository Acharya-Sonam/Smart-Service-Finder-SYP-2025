import db from "../database.js";

const UserModel = {
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        contact VARCHAR(20),
        location VARCHAR(150),
        role ENUM('Admin', 'Service Provider', 'Customer') NOT NULL DEFAULT 'Customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(sql);
    console.log("✅ Users table ready");
  },

  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT id, fullName, email, contact, location, role, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  async create({ fullName, email, password, contact, location, role }) {
    const [result] = await db.query(
      "INSERT INTO users (fullName, email, password, contact, location, role) VALUES (?, ?, ?, ?, ?, ?)",
      [fullName, email, password, contact, location, role]
    );
    return result.insertId;
  },
};

export default UserModel;