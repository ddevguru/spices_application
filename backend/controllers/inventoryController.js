const db = require('../config/db');

exports.getInventory = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = `
        SELECT
          v.id as variant_id,
          v.title as variant_title,
          v.weight_in_grams,
          v.stock_quantity,
          v.price::float,
          v.sku,
          v.is_available,
          p.id as product_id,
          p.name as product_name,
          p.category_name
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        ORDER BY p.name ASC, v.weight_in_grams ASC
      `;
      const result = await db.query(q);
      const rows = result.rows.map((r) => ({
        variantId: r.variant_id,
        variantTitle: r.variant_title,
        weightInGrams: r.weight_in_grams,
        stockQuantity: r.stock_quantity,
        price: r.price,
        sku: r.sku,
        isAvailable: r.is_available,
        productId: r.product_id,
        productName: r.product_name,
        categoryName: r.category_name,
      }));
      return res.json(rows);
    } else {
      const fb = db.getFallbackDb();
      const rows = [];
      (fb.products || []).forEach((p) => {
        (p.variants || []).forEach((v) => {
          rows.push({
            productId: p.id,
            productName: p.name,
            categoryName: p.categoryName,
            variantId: v.id,
            variantTitle: v.title,
            weightInGrams: v.weightInGrams,
            stockQuantity: v.stockQuantity,
            price: v.price,
            sku: v.sku,
            isAvailable: v.isAvailable,
          });
        });
      });
      return res.json(rows);
    }
  } catch (err) {
    next(err);
  }
};

exports.adjustStock = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { delta, newStock } = req.body;

    if (db.isPostgresConnected()) {
      let q;
      let params;
      if (newStock !== undefined) {
        q = `UPDATE product_variants SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
        params = [Math.max(0, newStock), variantId];
      } else {
        q = `UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity + $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
        params = [delta || 0, variantId];
      }
      const result = await db.query(q, params);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Variant not found' });
      return res.json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      for (const p of fb.products) {
        const v = p.variants.find((item) => item.id === variantId);
        if (v) {
          if (newStock !== undefined) v.stockQuantity = Math.max(0, newStock);
          else v.stockQuantity = Math.max(0, (v.stockQuantity || 0) + (delta || 0));
          db.saveFallbackDb(fb);
          return res.json(v);
        }
      }
      return res.status(404).json({ error: 'Variant not found' });
    }
  } catch (err) {
    next(err);
  }
};

