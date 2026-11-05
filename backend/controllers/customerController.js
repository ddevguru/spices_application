const db = require('../config/db');

exports.getCustomers = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = 'SELECT * FROM customers ORDER BY registered_date DESC';
      const result = await db.query(q);
      const rows = result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        mobile: r.phone,
        city: r.city,
        registeredDate: r.registered_date ? r.registered_date.toISOString().slice(0, 10) : '2026-08-01',
        totalOrders: r.total_orders,
        totalSpent: parseFloat(r.total_spent) || 0,
      }));
      return res.json(rows);
    } else {
      const fb = db.getFallbackDb();
      return res.json(fb.customers || []);
    }
  } catch (err) {
    next(err);
  }
};

