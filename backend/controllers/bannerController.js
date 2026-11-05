const db = require('../config/db');

exports.getBanners = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = 'SELECT * FROM banners ORDER BY display_order ASC';
      const result = await db.query(q);
      const rows = result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        description: r.description,
        image: r.image,
        ctaText: r.cta_text,
        targetCategory: r.target_category,
        badge: r.badge,
        order: r.display_order,
        isActive: r.is_active,
      }));
      return res.json(rows);
    } else {
      const fb = db.getFallbackDb();
      return res.json(fb.banners || []);
    }
  } catch (err) {
    next(err);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, description, image, ctaText, targetCategory, badge, order } = req.body;
    const bId = `bnr_${Date.now()}`;

    if (db.isPostgresConnected()) {
      const q = `
        INSERT INTO banners (id, title, subtitle, description, image, cta_text, target_category, badge, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
        RETURNING *
      `;
      const result = await db.query(q, [
        bId,
        title,
        subtitle,
        description,
        image,
        ctaText || 'Shop Now',
        targetCategory,
        badge || '',
        order || 1,
      ]);
      return res.status(201).json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      const newB = {
        id: bId,
        title,
        subtitle,
        description,
        image,
        ctaText: ctaText || 'Shop Now',
        targetCategory,
        badge: badge || '',
        order: order || fb.banners.length + 1,
        isActive: true,
      };
      fb.banners.push(newB);
      db.saveFallbackDb(fb);
      return res.status(201).json(newB);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (db.isPostgresConnected()) {
      await db.query('DELETE FROM banners WHERE id = $1', [id]);
    } else {
      const fb = db.getFallbackDb();
      fb.banners = fb.banners.filter((b) => b.id !== id);
      db.saveFallbackDb(fb);
    }
    return res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
};

