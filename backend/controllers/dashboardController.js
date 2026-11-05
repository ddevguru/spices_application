const db = require('../config/db');

exports.getMetrics = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const ordersRes = await db.query('SELECT total_amount, status FROM orders');
      const productsCountRes = await db.query('SELECT COUNT(*) FROM products');
      const customersCountRes = await db.query('SELECT COUNT(*) FROM customers');
      const lowStockRes = await db.query('SELECT COUNT(*) FROM product_variants WHERE stock_quantity <= 15');
      const recentOrdersRes = await db.query(`
        SELECT o.id, o.customer_name as "customerName", o.total_amount as "totalAmount", o.status, o.payment_method as "paymentMethod", o.created_at as "createdAt"
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT 5
      `);

      const totalRevenue = ordersRes.rows.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const pendingOrders = ordersRes.rows.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

      return res.json({
        totalRevenue,
        totalOrders: ordersRes.rows.length,
        totalProducts: parseInt(productsCountRes.rows[0].count, 10),
        totalCustomers: parseInt(customersCountRes.rows[0].count, 10),
        pendingOrders,
        lowStockCount: parseInt(lowStockRes.rows[0].count, 10),
        recentOrders: recentOrdersRes.rows,
        salesData: [
          { month: 'Jun', sales: 45000, orders: 48 },
          { month: 'Jul', sales: 58000, orders: 62 },
          { month: 'Aug', sales: 74000, orders: 85 },
          { month: 'Sep', sales: 89000, orders: 98 },
          { month: 'Oct', sales: 112000, orders: 124 },
          { month: 'Nov', sales: 135000, orders: 148 },
        ],
        categorySales: [
          { name: 'Dry Fruits', value: 45, color: '#FF812E' },
          { name: 'Whole Spices', value: 25, color: '#FFA45B' },
          { name: 'Blended Spices', value: 18, color: '#27865F' },
          { name: 'Cereals', value: 12, color: '#898078' },
        ],
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
        salesData: [
          { month: 'Jun', sales: 45000, orders: 48 },
          { month: 'Jul', sales: 58000, orders: 62 },
          { month: 'Aug', sales: 74000, orders: 85 },
          { month: 'Sep', sales: 89000, orders: 98 },
          { month: 'Oct', sales: 112000, orders: 124 },
          { month: 'Nov', sales: 135000, orders: 148 },
        ],
        categorySales: [
          { name: 'Dry Fruits', value: 45, color: '#FF812E' },
          { name: 'Whole Spices', value: 25, color: '#FFA45B' },
          { name: 'Blended Spices', value: 18, color: '#27865F' },
          { name: 'Cereals', value: 12, color: '#898078' },
        ],
      });
    }
  } catch (err) {
    next(err);
  }
};

