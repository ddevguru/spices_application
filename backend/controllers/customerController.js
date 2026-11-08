const db = require('../config/db');

exports.getCustomers = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = 'SELECT * FROM customers ORDER BY registered_date DESC';
      const result = await db.query(q);
      let rows = result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        mobile: r.phone,
        city: r.city,
        registeredDate: r.registered_date ? r.registered_date.toISOString().slice(0, 10) : 'Recent',
        totalOrders: r.total_orders || 1,
        totalSpent: parseFloat(r.total_spent) || 0,
      }));

      // If customers table is empty, aggregate from existing orders
      if (rows.length === 0) {
        try {
          const ordQuery = `
            SELECT 
              customer_name as name,
              customer_phone as phone,
              customer_email as email,
              (shipping_address->>'city') as city,
              MIN(created_at) as registered_date,
              COUNT(id)::int as total_orders,
              SUM(total_amount)::float as total_spent
            FROM orders
            WHERE customer_name IS NOT NULL AND customer_name != ''
            GROUP BY customer_name, customer_phone, customer_email, (shipping_address->>'city')
            ORDER BY MIN(created_at) DESC
          `;
          const ordRes = await db.query(ordQuery);
          if (ordRes.rows.length > 0) {
            rows = ordRes.rows.map((r, i) => ({
              id: 'cust_' + (r.phone || i),
              name: r.name,
              email: r.email || '',
              mobile: r.phone || '',
              city: r.city || 'India',
              registeredDate: r.registered_date ? new Date(r.registered_date).toISOString().slice(0, 10) : 'Recent',
              totalOrders: r.total_orders || 1,
              totalSpent: r.total_spent || 0,
            }));
          }
        } catch (_) {}
      }

      return res.json(rows);
    } else {
      const fb = db.getFallbackDb();
      let customers = Array.isArray(fb.customers) ? [...fb.customers] : [];

      // If empty, aggregate from fb.orders
      if (customers.length === 0 && Array.isArray(fb.orders) && fb.orders.length > 0) {
        const custMap = new Map();
        for (const ord of fb.orders) {
          const c = ord.customer;
          if (!c || !c.name) continue;
          const key = (c.phone || c.email || c.name).toLowerCase();
          if (!custMap.has(key)) {
            custMap.set(key, {
              id: 'cust_' + (c.phone || Math.random().toString(36).substr(2, 6)),
              name: c.name,
              businessName: c.businessName || '',
              gstNumber: c.gstNumber || '',
              email: c.email || '',
              mobile: c.phone || '',
              phone: c.phone || '',
              city: (c.address && c.address.city) || 'India',
              registeredDate: ord.createdAt ? ord.createdAt.slice(0, 10) : 'Recent',
              totalOrders: 0,
              totalSpent: 0,
              status: 'Active',
            });
          }
          const existing = custMap.get(key);
          existing.totalOrders += 1;
          existing.totalSpent += (ord.totalAmount || 0);
        }
        customers = Array.from(custMap.values());
        fb.customers = customers;
        db.saveFallbackDb(fb);
      }

      return res.json(customers);
    }
  } catch (err) {
    next(err);
  }
};
