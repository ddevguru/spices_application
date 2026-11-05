const db = require('../config/db');

exports.getCategories = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const result = await db.query('SELECT * FROM categories ORDER BY display_order ASC');
      // Format subcategories JSON
      const categories = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        image: row.image,
        description: row.description,
        order: row.display_order,
        isActive: row.is_active,
        subcategories: typeof row.subcategories === 'string' ? JSON.parse(row.subcategories) : row.subcategories,
      }));
      res.json(categories);
    } else {
      const fb = db.getFallbackDb();
      res.json(fb.categories || []);
    }
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, image, description, order, isActive, subcategories } = req.body;
    const catId = `cat_${Date.now()}`;
    const catSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    if (db.isPostgresConnected()) {
      const query = `
        INSERT INTO categories (id, name, slug, image, description, display_order, is_active, subcategories)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const result = await db.query(query, [
        catId,
        name,
        catSlug,
        image,
        description,
        order || 1,
        isActive !== false,
        JSON.stringify(subcategories || []),
      ]);
      res.status(201).json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      const newCat = {
        id: catId,
        name,
        slug: catSlug,
        image,
        description,
        order: order || fb.categories.length + 1,
        isActive: isActive !== false,
        subcategories: subcategories || [],
      };
      fb.categories.push(newCat);
      db.saveFallbackDb(fb);
      res.status(201).json(newCat);
    }
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, image, description, order, isActive, subcategories } = req.body;

    if (db.isPostgresConnected()) {
      const query = `
        UPDATE categories
        SET name = COALESCE($1, name),
            slug = COALESCE($2, slug),
            image = COALESCE($3, image),
            description = COALESCE($4, description),
            display_order = COALESCE($5, display_order),
            is_active = COALESCE($6, is_active),
            subcategories = COALESCE($7, subcategories),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      const result = await db.query(query, [
        name,
        slug,
        image,
        description,
        order,
        isActive,
        subcategories ? JSON.stringify(subcategories) : null,
        id,
      ]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
      res.json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      const idx = fb.categories.findIndex((c) => c.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Category not found' });
      fb.categories[idx] = { ...fb.categories[idx], ...req.body };
      db.saveFallbackDb(fb);
      res.json(fb.categories[idx]);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (db.isPostgresConnected()) {
      await db.query('DELETE FROM categories WHERE id = $1', [id]);
    } else {
      const fb = db.getFallbackDb();
      fb.categories = fb.categories.filter((c) => c.id !== id);
      db.saveFallbackDb(fb);
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

