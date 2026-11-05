const db = require('../config/db');

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
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

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

