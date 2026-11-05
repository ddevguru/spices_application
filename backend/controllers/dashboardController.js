const db = require('../config/db');

exports.getMetrics = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const ordersRes = await db.query('SELECT total_amount, status, created_at FROM orders');
      const productsCountRes = await db.query('SELECT COUNT(*) FROM products');
      const customersCountRes = await db.query('SELECT COUNT(*) FROM customers');
      const lowStockRes = await db.query('SELECT COUNT(*) FROM product_variants WHERE stock_quantity <= 15');
      const categoryShareRes = await db.query(`
        SELECT c.name, COUNT(p.id) as count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.name
      `);

      const recentOrdersRes = await db.query(`
        SELECT o.id, o.customer_name as "customerName", o.total_amount as "totalAmount", o.status, o.payment_method as "paymentMethod", o.created_at as "createdAt"
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT 5
      `);

      const totalRevenue = ordersRes.rows.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const pendingOrders = ordersRes.rows.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

      // Real category breakdown based on actual products in DB
      const catColors = {
        'Dry Fruits': '#FF812E',
        'Whole Spices': '#FFA45B',
        'Blended Spices': '#27865F',
        'Cereals': '#898078'
      };
      const categorySales = categoryShareRes.rows.map(row => ({
        name: row.name,
        value: parseInt(row.count, 10) || 0,
        color: catColors[row.name] || '#FF812E'
      }));

      // Real monthly revenue aggregation (only from actual orders)
      const salesMap = {};
      ordersRes.rows.forEach(o => {
        const d = new Date(o.created_at);
        const m = d.toLocaleString('en-US', { month: 'short' });
        salesMap[m] = (salesMap[m] || 0) + parseFloat(o.total_amount || 0);
      });

      const salesData = Object.keys(salesMap).length > 0 
        ? Object.entries(salesMap).map(([month, sales]) => ({ month, sales, orders: 1 }))
        : [];

      return res.json({
        totalRevenue,
        totalOrders: ordersRes.rows.length,
        totalProducts: parseInt(productsCountRes.rows[0].count, 10),
        totalCustomers: parseInt(customersCountRes.rows[0].count, 10),
        pendingOrders,
        lowStockCount: parseInt(lowStockRes.rows[0].count, 10),
        recentOrders: recentOrdersRes.rows,
        salesData,
        categorySales,
      });
    } else {
      const fb = db.getFallbackDb();
      const orders = fb.orders || [];
      const products = fb.products || [];
      const customers = fb.customers || [];

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

      let lowStockCount = 0;
      products.forEach((p) => {
        (p.variants || []).forEach((v) => {
          if (v.stockQuantity <= 15) lowStockCount++;
        });
      });

      return res.json({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        pendingOrders,
        lowStockCount,
        recentOrders: orders.slice(0, 5),
        salesData: [],
        categorySales: [
          { name: 'Dry Fruits', value: 7, color: '#FF812E' },
          { name: 'Whole Spices', value: 3, color: '#FFA45B' },
          { name: 'Blended Spices', value: 2, color: '#27865F' },
          { name: 'Cereals', value: 2, color: '#898078' }
        ],
      });
    }
  } catch (err) {
    next(err);
  }
};
