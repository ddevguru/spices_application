const db = require('../config/db');

exports.getCustomers = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = 'SELECT * FROM customers ORDER BY registered_date DESC';
      const result = await db.query(q);
      let rows = result.rows.map((r) => {
        const lic = `NAT-LIC-2026-${Math.abs(String(r.id).split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) % 900000 + 100000}`;
        return {
          id: r.id,
          name: r.name,
          email: r.email,
          mobile: r.phone,
          phone: r.phone,
          city: r.city,
          registeredDate: r.registered_date ? r.registered_date.toISOString().slice(0, 10) : 'Recent',
          totalOrders: r.total_orders || 0,
          totalSpent: parseFloat(r.total_spent) || 0,
          businessName: r.business_name || '',
          shopName: r.shop_name || '',
          gstNumber: r.gst_number || '',
          licenseNumber: r.license_number || lic,
        };
      });

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
            rows = ordRes.rows.map((r, i) => {
              const lic = `NAT-LIC-2026-${(100000 + (i * 12345) % 900000)}`;
              return {
                id: 'cust_' + (r.phone || i),
                name: r.name,
                email: r.email || '',
                mobile: r.phone || '',
                phone: r.phone || '',
                city: r.city || 'India',
                registeredDate: r.registered_date ? new Date(r.registered_date).toISOString().slice(0, 10) : 'Recent',
                totalOrders: r.total_orders || 1,
                totalSpent: r.total_spent || 0,
                businessName: '',
                shopName: '',
                gstNumber: '',
                licenseNumber: lic,
              };
            });
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
            const lic = `NAT-LIC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
            custMap.set(key, {
              id: 'cust_' + (c.phone || Math.random().toString(36).substr(2, 6)),
              name: c.name,
              businessName: c.businessName || '',
              shopName: c.shopName || '',
              gstNumber: c.gstNumber || '',
              licenseNumber: c.licenseNumber || lic,
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

exports.syncCustomer = async (req, res, next) => {
  try {
    const { id, name, email, phone, city, ownerName, businessName, shopName, gstNumber, licenseNumber } = req.body;
    const cleanId = id || `cust_${Date.now()}`;
    const cleanName = (name || ownerName || 'Customer').trim();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').trim();
    const cleanCity = (city || 'India').trim();
    const cleanBiz = (businessName || shopName || '').trim();
    const cleanShop = (shopName || businessName || '').trim();
    const cleanGst = (gstNumber || '').trim();
    const cleanLic = (licenseNumber || `NAT-LIC-2026-${Math.floor(100000 + Math.random() * 900000)}`).trim();

    if (db.isPostgresConnected()) {
      try {
        if (cleanEmail) {
          await db.query(
            `INSERT INTO customers (id, name, email, phone, city, registered_date, total_orders, total_spent, addresses)
             VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 0, 0.00, '[]'::jsonb)
             ON CONFLICT (email) DO UPDATE SET
               name = COALESCE(NULLIF(EXCLUDED.name, ''), customers.name),
               phone = COALESCE(NULLIF(EXCLUDED.phone, ''), customers.phone),
               city = COALESCE(NULLIF(EXCLUDED.city, ''), customers.city);`,
            [cleanId, cleanName, cleanEmail, cleanPhone, cleanCity]
          );
        } else {
          await db.query(
            `INSERT INTO customers (id, name, email, phone, city, registered_date, total_orders, total_spent, addresses)
             VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 0, 0.00, '[]'::jsonb)
             ON CONFLICT (id) DO UPDATE SET
               name = COALESCE(NULLIF(EXCLUDED.name, ''), customers.name),
               phone = COALESCE(NULLIF(EXCLUDED.phone, ''), customers.phone),
               city = COALESCE(NULLIF(EXCLUDED.city, ''), customers.city);`,
            [cleanId, cleanName, cleanEmail, cleanPhone, cleanCity]
          );
        }
      } catch (dbErr) {
        console.warn('Postgres customer sync warning:', dbErr.message);
      }
    }

    // Always update fallback DB
    const fb = db.getFallbackDb();
    if (!Array.isArray(fb.customers)) fb.customers = [];

    const existingIdx = fb.customers.findIndex(
      (c) => (cleanEmail && c.email?.toLowerCase() === cleanEmail) || (cleanPhone && (c.phone === cleanPhone || c.mobile === cleanPhone)) || c.id === cleanId
    );

    const customerObj = {
      id: cleanId,
      name: cleanName,
      email: cleanEmail,
      mobile: cleanPhone,
      phone: cleanPhone,
      city: cleanCity,
      ownerName: ownerName || cleanName,
      businessName: cleanBiz,
      shopName: cleanShop,
      gstNumber: cleanGst,
      licenseNumber: cleanLic,
      registeredDate: new Date().toISOString().slice(0, 10),
      totalOrders: 0,
      totalSpent: 0,
      status: 'Active',
    };

    if (existingIdx >= 0) {
      fb.customers[existingIdx] = {
        ...fb.customers[existingIdx],
        ...customerObj,
        totalOrders: fb.customers[existingIdx].totalOrders || 0,
        totalSpent: fb.customers[existingIdx].totalSpent || 0,
        registeredDate: fb.customers[existingIdx].registeredDate || customerObj.registeredDate,
      };
    } else {
      fb.customers.unshift(customerObj);
    }
    db.saveFallbackDb(fb);

    return res.json({ success: true, customer: customerObj });
  } catch (err) {
    next(err);
  }
};
