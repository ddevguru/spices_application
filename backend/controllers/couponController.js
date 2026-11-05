const db = require('../config/db');

exports.getCoupons = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const result = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
      const rows = result.rows.map((r) => ({
        id: r.id,
        code: r.code,
        description: r.description,
        discountType: r.discount_type,
        discountValue: parseFloat(r.discount_value),
        minOrderValue: parseFloat(r.min_order_value),
        maxDiscount: parseFloat(r.max_discount),
        expiryDate: r.expiry_date ? r.expiry_date.toISOString().slice(0, 10) : '2026-12-31',
        isActive: r.is_active,
      }));
      return res.json(rows);
    } else {
      const fb = db.getFallbackDb();
      return res.json(fb.coupons || []);
    }
  } catch (err) {
    next(err);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, expiryDate } = req.body;
    const cpnId = `cpn_${Date.now()}`;

    if (db.isPostgresConnected()) {
      const q = `
        INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_value, max_discount, expiry_date, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        RETURNING *
      `;
      const result = await db.query(q, [
        cpnId,
        code.toUpperCase(),
        description,
        discountType || 'percentage',
        discountValue,
        minOrderValue || 0,
        maxDiscount || 9999,
        expiryDate || '2026-12-31',
      ]);
      return res.status(201).json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      const newC = {
        id: cpnId,
        code: code.toUpperCase(),
        description,
        discountType: discountType || 'percentage',
        discountValue: parseFloat(discountValue) || 10,
        minOrderValue: parseFloat(minOrderValue) || 0,
        maxDiscount: parseFloat(maxDiscount) || 9999,
        expiryDate: expiryDate || '2026-12-31',
        isActive: true,
      };
      fb.coupons.push(newC);
      db.saveFallbackDb(fb);
      return res.status(201).json(newC);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (db.isPostgresConnected()) {
      await db.query('DELETE FROM coupons WHERE id = $1', [id]);
    } else {
      const fb = db.getFallbackDb();
      fb.coupons = fb.coupons.filter((c) => c.id !== id);
      db.saveFallbackDb(fb);
    }
    return res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

