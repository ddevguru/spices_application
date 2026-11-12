const db = require('../config/db');

function extractProductShortName(items) {
  if (!items || items.length === 0) return 'order';
  const first = items[0];
  const name = String(first.productName || first.name || first.productId || '').toLowerCase();
  
  if (name.includes('almond') || name.includes('badam')) return 'almond';
  if (name.includes('cashew') || name.includes('kaju')) return 'cashew';
  if (name.includes('pista') || name.includes('pistachio')) return 'pista';
  if (name.includes('walnut') || name.includes('akhrot')) return 'walnut';
  if (name.includes('date') || name.includes('ajwa') || name.includes('khejur') || name.includes('khajoor')) return 'dates';
  if (name.includes('raisin') || name.includes('kishmish')) return 'raisins';
  if (name.includes('fig') || name.includes('anjeer')) return 'anjeer';
  if (name.includes('apricot') || name.includes('jardalu')) return 'apricot';
  if (name.includes('mixed') || name.includes('mix')) return 'mixdryfruit';
  if (name.includes('cardamom') || name.includes('elaichi')) return 'cardamom';
  if (name.includes('pepper') || name.includes('mirch')) return 'blackpepper';
  if (name.includes('cinnamon') || name.includes('dalchini')) return 'cinnamon';
  if (name.includes('clove') || name.includes('laung')) return 'clove';
  if (name.includes('cumin') || name.includes('jeera')) return 'cumin';
  if (name.includes('coriander') || name.includes('dhaniya')) return 'coriander';
  if (name.includes('star anise') || name.includes('chakraphool')) return 'staranise';
  if (name.includes('garam') || name.includes('masala')) return 'garammasala';
  if (name.includes('turmeric') || name.includes('haldi')) return 'turmeric';
  if (name.includes('chilli') || name.includes('mirchi')) return 'chilli';
  if (name.includes('oat')) return 'oats';
  if (name.includes('quinoa')) return 'quinoa';
  if (name.includes('ragi')) return 'ragi';
  if (name.includes('jowar')) return 'jowar';
  if (name.includes('millet')) return 'millets';

  const clean = name.replace(/[^a-z0-9]/g, '');
  return clean ? clean.slice(0, 10) : 'dryfruit';
}

async function generateCustomOrderId(items, dbInstance) {
  const shortName = extractProductShortName(items);
  const now = new Date();
  
  // Format DDMMYYYY
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear());
  const dateStr = `${day}${month}${year}`;

  // Format HHMMSS
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}${mins}${secs}`;

  let nextNum = 1;
  try {
    if (dbInstance && dbInstance.isPostgresConnected()) {
      const res = await dbInstance.query(`SELECT COUNT(*) as count FROM orders WHERE id ILIKE $1`, [`${shortName}-%`]);
      nextNum = (parseInt(res.rows[0].count, 10) || 0) + 1;
    } else if (dbInstance) {
      const fb = dbInstance.getFallbackDb();
      const count = (fb.orders || []).filter(o => o.id && o.id.toLowerCase().startsWith(`${shortName}-`)).length;
      nextNum = count + 1;
    }
  } catch (_) {
    nextNum = 1;
  }

  const numStr = String(nextNum).padStart(2, '0');
  return `${shortName}-${numStr}-${dateStr}-${timeStr}`;
}

exports.getOrders = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = `
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'productId', oi.product_id,
                'productName', oi.product_name,
                'variantId', oi.variant_id,
                'variantTitle', oi.variant_title,
                'weightInGrams', oi.weight_in_grams,
                'price', oi.price::float,
                'quantity', oi.quantity,
                'image', oi.image
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      const result = await db.query(q);
      const orders = result.rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        status: r.status,
        customer: {
          name: r.customer_name,
          phone: r.customer_phone,
          email: r.customer_email,
          address: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : r.shipping_address,
        },
        items: r.items,
        subtotal: parseFloat(r.subtotal),
        discount: parseFloat(r.discount),
        couponCode: r.coupon_code || '',
        deliveryFee: parseFloat(r.delivery_fee),
        tax: parseFloat(r.tax),
        totalAmount: parseFloat(r.total_amount),
        paymentMethod: r.payment_method,
        paymentStatus: r.payment_status,
      }));
      return res.json(orders);
    } else {
      const fb = db.getFallbackDb();
      return res.json(fb.orders || []);
    }
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { customer, items, subtotal, discount, couponCode, deliveryFee, tax, totalAmount, paymentMethod, deliveryInstructions } = req.body;
    let orderId = req.body.id;
    if (!orderId || orderId.startsWith('ORD-') || orderId.startsWith('temp_')) {
      orderId = await generateCustomOrderId(items, db);
    }

    if (db.isPostgresConnected()) {
      const pool = db.getPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // 1. Insert order
        await client.query(`
          INSERT INTO orders (
            id, customer_name, customer_phone, customer_email, shipping_address,
            delivery_instructions, subtotal, discount, coupon_code, delivery_fee, tax,
            total_amount, payment_method, payment_status, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          orderId,
          customer.name,
          customer.phone,
          customer.email,
          JSON.stringify(customer.address || {}),
          deliveryInstructions || '',
          subtotal || 0,
          discount || 0,
          couponCode || '',
          deliveryFee || 0,
          tax || 0,
          totalAmount || 0,
          paymentMethod || 'UPI',
          'Paid',
          'Confirmed',
        ]);

        // 2. Insert items and deduct variant stock
        for (const item of items) {
          await client.query(`
            INSERT INTO order_items (
              order_id, product_id, product_name, variant_id, variant_title,
              weight_in_grams, price, quantity, image
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            orderId,
            item.productId,
            item.productName,
            item.variantId,
            item.variantTitle,
            item.weightInGrams || 250,
            item.price,
            item.quantity,
            item.image || '',
          ]);

          // Deduct variant stock
          if (item.variantId) {
            await client.query(`
              UPDATE product_variants
              SET stock_quantity = GREATEST(0, stock_quantity - $1),
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
            `, [item.quantity, item.variantId]);
          }
        }

        // 3. Upsert customer record
        if (customer && customer.name) {
          const custPhone = customer.phone || '';
          const custEmail = (customer.email || '').toLowerCase().trim();
          const custCity = (customer.address && customer.address.city) || 'India';
          const custId = 'cust_' + (custPhone || (custEmail ? custEmail.replace(/[^a-z0-9]/g, '_') : Date.now()));
          try {
            if (custEmail) {
              await client.query(`
                INSERT INTO customers (id, name, phone, email, city, total_orders, total_spent)
                VALUES ($1, $2, $3, $4, $5, 1, $6)
                ON CONFLICT (email) DO UPDATE SET
                  total_orders = customers.total_orders + 1,
                  total_spent = customers.total_spent + $6,
                  phone = COALESCE(NULLIF(EXCLUDED.phone, ''), customers.phone),
                  city = COALESCE(NULLIF(EXCLUDED.city, ''), customers.city)
              `, [custId, customer.name, custPhone, custEmail, custCity, totalAmount || 0]);
            } else {
              await client.query(`
                INSERT INTO customers (id, name, phone, email, city, total_orders, total_spent)
                VALUES ($1, $2, $3, $4, $5, 1, $6)
                ON CONFLICT (id) DO UPDATE SET
                  total_orders = customers.total_orders + 1,
                  total_spent = customers.total_spent + $6,
                  city = COALESCE(NULLIF(EXCLUDED.city, ''), customers.city)
              `, [custId, customer.name, custPhone, custEmail, custCity, totalAmount || 0]);
            }
          } catch (e) {
            console.warn('Customer upsert error during order:', e.message);
          }
        }

        await client.query('COMMIT');

        const newOrder = {
          id: orderId,
          createdAt: new Date().toISOString(),
          status: 'Confirmed',
          customer,
          items,
          subtotal,
          discount,
          couponCode,
          deliveryFee,
          totalAmount,
          paymentMethod,
          paymentStatus: 'Paid',
        };

        return res.status(201).json(newOrder);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Fallback
      const fb = db.getFallbackDb();
      const newOrder = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'Confirmed',
        customer,
        items,
        subtotal,
        discount: discount || 0,
        couponCode: couponCode || '',
        deliveryFee: deliveryFee || 0,
        tax: tax || 0,
        totalAmount,
        paymentMethod: paymentMethod || 'UPI',
        paymentStatus: 'Paid',
      };

      // Deduct stock in fallback
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const prod = fb.products.find((p) => p.id === item.productId);
          if (prod && prod.variants) {
            const v = prod.variants.find((v) => v.id === item.variantId);
            if (v) v.stockQuantity = Math.max(0, (v.stockQuantity || 0) - item.quantity);
          }
        }
      }

      if (!Array.isArray(fb.customers)) fb.customers = [];
      if (customer && customer.name) {
        const custPhone = customer.phone || '';
        const custEmail = customer.email || '';
        const custCity = (customer.address && customer.address.city) || 'India';
        const existingCust = fb.customers.find((c) =>
          (custPhone && (c.mobile === custPhone || c.phone === custPhone)) ||
          (custEmail && c.email === custEmail) ||
          c.name.toLowerCase() === customer.name.toLowerCase()
        );
        if (existingCust) {
          existingCust.totalOrders = (existingCust.totalOrders || 0) + 1;
          existingCust.totalSpent = (existingCust.totalSpent || 0) + (totalAmount || 0);
          if (custCity) existingCust.city = custCity;
        } else {
          fb.customers.unshift({
            id: 'cust_' + Date.now(),
            name: customer.name,
            businessName: customer.businessName || '',
            gstNumber: customer.gstNumber || '',
            email: custEmail,
            mobile: custPhone,
            phone: custPhone,
            city: custCity,
            registeredDate: new Date().toISOString().slice(0, 10),
            totalOrders: 1,
            totalSpent: totalAmount || 0,
            status: 'Active',
          });
        }
      }

      fb.orders.unshift(newOrder);
      db.saveFallbackDb(fb);
      return res.status(201).json(newOrder);
    }
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (db.isPostgresConnected()) {
      const q = `
        UPDATE orders
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await db.query(q, [status, id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
      return res.json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      const order = fb.orders.find((o) => o.id === id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      order.status = status;
      order.updatedAt = new Date().toISOString();
      db.saveFallbackDb(fb);
      return res.json(order);
    }
  } catch (err) {
    next(err);
  }
};

