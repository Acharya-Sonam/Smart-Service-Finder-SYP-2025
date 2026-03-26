import AdminModel from "../models/Admin.js";
import db from "../database.js";

// ==================== DASHBOARD STATS ====================
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

// ==================== USER MANAGEMENT ====================
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

// ==================== SERVICE MANAGEMENT ====================
export const getAllServices = async (req, res) => {
  try {
    const services = await AdminModel.getAllServices();
    return res.status(200).json({ count: services.length, services });
  } catch (err) {
    console.error("getAllServices error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, description, price, category, duration, status } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const [result] = await db.query(
      `INSERT INTO services (name, description, price, category, duration, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, description, price, category, parseInt(duration), status || 'active']
    );
    
    // Get the created service
    const [newService] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [result.insertId]
    );
    
    return res.status(201).json({
      message: "Service created successfully",
      service: newService[0]
    });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, duration, status } = req.body;
    
    // Check if service exists
    const [existingService] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [id]
    );
    
    if (existingService.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    // Update service
    await db.query(
      `UPDATE services 
       SET name = ?, description = ?, price = ?, category = ?, duration = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, price, category, duration, status, id]
    );
    
    // Get updated service
    const [updatedService] = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [id]
    );
    
    return res.status(200).json({
      message: "Service updated successfully",
      service: updatedService[0]
    });
  } catch (err) {
    console.error("updateService error:", err);
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

// ==================== BOOKING MANAGEMENT ====================
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await AdminModel.getAllBookings();
    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("getAllBookings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await db.query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    return res.status(200).json({ message: "Booking status updated" });
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==================== REVIEW MANAGEMENT ====================
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await AdminModel.getAllReviews();
    return res.status(200).json({ count: reviews.length, reviews });
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if review exists
    const [existingReview] = await db.query(
      "SELECT * FROM reviews WHERE id = ?",
      [id]
    );
    
    if (existingReview.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Update review status
    await db.query(
      `UPDATE reviews 
       SET status = 'approved', approved_at = NOW(), approved_by = ?
       WHERE id = ?`,
      [req.user.id, id]
    );
    
    // Get updated review
    const [updatedReview] = await db.query(
      "SELECT * FROM reviews WHERE id = ?",
      [id]
    );
    
    return res.status(200).json({
      message: "Review approved successfully",
      review: updatedReview[0]
    });
  } catch (err) {
    console.error("approveReview error:", err);
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

// ==================== SYSTEM LOGS ====================
export const getSystemLogs = async (req, res) => {
  try {
    const logs = await AdminModel.getSystemLogs();
    return res.status(200).json({ logs });
  } catch (err) {
    console.error("getSystemLogs error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==================== LIVE LOCATION TRACKING ====================
export const getProviderLocations = async (req, res) => {
  try {
    const locations = await AdminModel.getProviderLocations();
    return res.status(200).json({ locations });
  } catch (err) {
    console.error("getProviderLocations error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==================== REVENUE STATS ====================
export const getRevenueStats = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let query = '';
    
    switch(period) {
      case 'weekly':
        query = `
          SELECT 
            DATE(created_at) as date,
            SUM(amount) as revenue,
            COUNT(*) as bookings
          FROM bookings
          WHERE status = 'completed'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
        break;
      case 'monthly':
        query = `
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(amount) as revenue,
            COUNT(*) as bookings
          FROM bookings
          WHERE status = 'completed'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month ASC
        `;
        break;
      case 'yearly':
        query = `
          SELECT 
            YEAR(created_at) as year,
            SUM(amount) as revenue,
            COUNT(*) as bookings
          FROM bookings
          WHERE status = 'completed'
          GROUP BY YEAR(created_at)
          ORDER BY year ASC
        `;
        break;
      default:
        query = `
          SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            SUM(amount) as revenue,
            COUNT(*) as bookings
          FROM bookings
          WHERE status = 'completed'
            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month ASC
        `;
    }
    
    const [revenueData] = await db.query(query);
    
    // Get top services
    const [topServices] = await db.query(`
      SELECT 
        s.name,
        COUNT(b.id) as bookings,
        SUM(b.amount) as revenue
      FROM services s
      JOIN bookings b ON s.id = b.service_id
      WHERE b.status = 'completed'
      GROUP BY s.id
      ORDER BY revenue DESC
      LIMIT 5
    `);
    
    // Calculate total revenue
    const [totalRevenue] = await db.query(`
      SELECT SUM(amount) as total 
      FROM bookings 
      WHERE status = 'completed'
    `);
    
    // Calculate average booking value
    const [avgBooking] = await db.query(`
      SELECT AVG(amount) as avg 
      FROM bookings 
      WHERE status = 'completed'
    `);
    
    // Calculate growth rate
    const [growthData] = await db.query(`
      SELECT 
        SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) 
          AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN amount END) as current_month,
        SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
          AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) THEN amount END) as previous_month
      FROM bookings
      WHERE status = 'completed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
    `);
    
    const growthRate = growthData[0]?.previous_month > 0 
      ? ((growthData[0].current_month - growthData[0].previous_month) / growthData[0].previous_month * 100).toFixed(2)
      : 0;
    
    // Format response
    const formattedData = {
      labels: revenueData.map(item => item.month || item.date || item.year),
      values: revenueData.map(item => parseFloat(item.revenue)),
      total_revenue: totalRevenue[0]?.total || 0,
      avg_booking_value: avgBooking[0]?.avg || 0,
      growth_rate: growthRate,
      top_services: topServices.map(service => ({
        name: service.name,
        bookings: service.bookings,
        revenue: parseFloat(service.revenue),
        percentage: (service.revenue / (totalRevenue[0]?.total || 1)) * 100
      }))
    };
    
    return res.status(200).json(formattedData);
  } catch (err) {
    console.error("getRevenueStats error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==================== SETTINGS MANAGEMENT ====================
export const getSettings = async (req, res) => {
  try {
    // Check if settings table exists
    const [tableCheck] = await db.query(
      "SHOW TABLES LIKE 'settings'"
    );
    
    if (tableCheck.length === 0) {
      // Return default settings if table doesn't exist
      const defaultSettings = {
        general: {
          site_name: 'Service Provider Platform',
          site_email: 'admin@example.com',
          timezone: 'UTC',
          date_format: 'YYYY-MM-DD',
          currency: 'USD'
        },
        notifications: {
          email_notifications: true,
          sms_notifications: false,
          admin_alerts: true,
          user_activity_alerts: true
        },
        security: {
          two_factor_auth: false,
          session_timeout: 30,
          max_login_attempts: 5,
          password_expiry_days: 90
        },
        appearance: {
          theme: 'light',
          primary_color: '#4f46e5',
          sidebar_collapsed: false
        }
      };
      
      return res.status(200).json({ settings: defaultSettings });
    }
    
    // Get settings from database
    const [settings] = await db.query(
      "SELECT * FROM settings WHERE id = 1"
    );
    
    if (settings.length === 0) {
      // Return default settings if no settings found
      const defaultSettings = {
        general: {
          site_name: 'Service Provider Platform',
          site_email: 'admin@example.com',
          timezone: 'UTC',
          date_format: 'YYYY-MM-DD',
          currency: 'USD'
        },
        notifications: {
          email_notifications: true,
          sms_notifications: false,
          admin_alerts: true,
          user_activity_alerts: true
        },
        security: {
          two_factor_auth: false,
          session_timeout: 30,
          max_login_attempts: 5,
          password_expiry_days: 90
        },
        appearance: {
          theme: 'light',
          primary_color: '#4f46e5',
          sidebar_collapsed: false
        }
      };
      
      return res.status(200).json({ settings: defaultSettings });
    }
    
    // Parse JSON fields if they're stored as strings
    const settingsData = settings[0];
    if (typeof settingsData.general === 'string') {
      settingsData.general = JSON.parse(settingsData.general);
      settingsData.notifications = JSON.parse(settingsData.notifications);
      settingsData.security = JSON.parse(settingsData.security);
      settingsData.appearance = JSON.parse(settingsData.appearance);
    }
    
    return res.status(200).json({ settings: settingsData });
  } catch (err) {
    console.error("getSettings error:", err);
    // Return default settings on error
    const defaultSettings = {
      general: {
        site_name: 'Service Provider Platform',
        site_email: 'admin@example.com',
        timezone: 'UTC',
        date_format: 'YYYY-MM-DD',
        currency: 'USD'
      },
      notifications: {
        email_notifications: true,
        sms_notifications: false,
        admin_alerts: true,
        user_activity_alerts: true
      },
      security: {
        two_factor_auth: false,
        session_timeout: 30,
        max_login_attempts: 5,
        password_expiry_days: 90
      },
      appearance: {
        theme: 'light',
        primary_color: '#4f46e5',
        sidebar_collapsed: false
      }
    };
    return res.status(200).json({ settings: defaultSettings });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // Check if settings table exists
    const [tableCheck] = await db.query(
      "SHOW TABLES LIKE 'settings'"
    );
    
    if (tableCheck.length === 0) {
      // Create settings table if it doesn't exist
      await db.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id INT PRIMARY KEY DEFAULT 1,
          general JSON,
          notifications JSON,
          security JSON,
          appearance JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          updated_by INT,
          FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
    }
    
    // Check if settings exist
    const [existingSettings] = await db.query(
      "SELECT * FROM settings WHERE id = 1"
    );
    
    if (existingSettings.length === 0) {
      // Insert new settings
      await db.query(
        `INSERT INTO settings (id, general, notifications, security, appearance, updated_by) 
         VALUES (1, ?, ?, ?, ?, ?)`,
        [
          JSON.stringify(settings.general),
          JSON.stringify(settings.notifications),
          JSON.stringify(settings.security),
          JSON.stringify(settings.appearance),
          req.user.id
        ]
      );
    } else {
      // Update existing settings
      await db.query(
        `UPDATE settings 
         SET general = ?, notifications = ?, security = ?, appearance = ?, updated_by = ?
         WHERE id = 1`,
        [
          JSON.stringify(settings.general),
          JSON.stringify(settings.notifications),
          JSON.stringify(settings.security),
          JSON.stringify(settings.appearance),
          req.user.id
        ]
      );
    }
    
    return res.status(200).json({
      message: "Settings updated successfully",
      settings
    });
  } catch (err) {
    console.error("updateSettings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};