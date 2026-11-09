const db = require('../config/db');

exports.getProducts = async (req, res, next) => {
  try {
    const { category, subcategory, search, featured, bestSeller, sort } = req.query;

    if (db.isPostgresConnected()) {
      let query = `
        SELECT p.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', v.id,
                'weightInGrams', v.weight_in_grams,
                'unit', v.unit,
                'title', v.title,
                'price', v.price::float,
                'originalPrice', v.original_price::float,
                'stockQuantity', v.stock_quantity,
                'sku', v.sku,
                'isAvailable', v.is_available
              ) ORDER BY v.weight_in_grams ASC
            ) FILTER (WHERE v.id IS NOT NULL), '[]'::json
          ) as variants
        FROM products p
        LEFT JOIN product_variants v ON p.id = v.product_id
        WHERE 1=1
      `;
      const params = [];
      let pIdx = 1;

      if (category && category !== 'all') {
        query += ` AND p.category_id = $${pIdx++}`;
        params.push(category);
      }
      if (subcategory && subcategory !== 'all') {
        query += ` AND p.subcategory_id = $${pIdx++}`;
        params.push(subcategory);
      }
      if (search) {
        query += ` AND (LOWER(p.name) LIKE $${pIdx} OR LOWER(p.short_description) LIKE $${pIdx} OR LOWER(p.category_name) LIKE $${pIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        pIdx++;
      }
      if (featured === 'true') {
        query += ` AND p.is_featured = true`;
      }
      if (bestSeller === 'true') {
        query += ` AND p.is_best_seller = true`;
      }

      query += ` GROUP BY p.id`;

      if (sort === 'best_selling') query += ` ORDER BY p.is_best_seller DESC, p.name ASC`;
      else if (sort === 'rating') query += ` ORDER BY p.rating DESC`;
      else query += ` ORDER BY p.created_at DESC`;

      const result = await db.query(query, params);

      // Map snake_case to camelCase for Flutter & React clients
      const formatted = result.rows.map(mapProductRow);
      return res.json(formatted);
    } else {
      const fb = db.getFallbackDb();
      let list = fb.products || [];

      if (category && category !== 'all') list = list.filter((p) => p.categoryId === category);
      if (subcategory && subcategory !== 'all') list = list.filter((p) => p.subcategoryId === subcategory);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
      }
      if (featured === 'true') list = list.filter((p) => p.isFeatured);
      if (bestSeller === 'true') list = list.filter((p) => p.isBestSeller);

      return res.json(list);
    }
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (db.isPostgresConnected()) {
      const cleanId = (id || '').trim().toUpperCase();
      const query = `
        SELECT p.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', v.id,
                'weightInGrams', v.weight_in_grams,
                'unit', v.unit,
                'title', v.title,
                'price', v.price::float,
                'originalPrice', v.original_price::float,
                'stockQuantity', v.stock_quantity,
                'sku', v.sku,
                'isAvailable', v.is_available
              ) ORDER BY v.weight_in_grams ASC
            ) FILTER (WHERE v.id IS NOT NULL), '[]'::json
          ) as variants
        FROM products p
        LEFT JOIN product_variants v ON p.id = v.product_id
        WHERE UPPER(p.id) = $1 
           OR UPPER(COALESCE(p.sku, '')) = $1 
           OR p.barcode = $1
           OR EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND (UPPER(pv.sku) = $1 OR pv.barcode = $1))
        GROUP BY p.id
        LIMIT 1
      `;
      const result = await db.query(query, [cleanId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.json(mapProductRow(result.rows[0]));
    } else {
      const fb = db.getFallbackDb();
      const product = (fb.products || []).find(
        (p) =>
          p.id === id ||
          p.sku === id ||
          p.barcode === id ||
          p.variants?.some((v) => v.sku === id || v.barcode === id)
      );
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.json(product);
    }
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const prod = req.body;
    const prodId = prod.id || `p_${Date.now()}`;

    if (db.isPostgresConnected()) {
      const q = `
        INSERT INTO products (
          id, name, brand, category_id, category_name, subcategory_id, subcategory_name,
          short_description, description, rating, review_count, image, gallery_images,
          origin, ingredients, nutrition_facts, storage_instructions, specifications,
          allow_custom_weight, is_featured, is_best_seller
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *
      `;
      const result = await db.query(q, [
        prodId,
        prod.name,
        prod.brand || 'Naturale Pure',
        prod.categoryId,
        prod.categoryName,
        prod.subcategoryId,
        prod.subcategoryName,
        prod.shortDescription,
        prod.description,
        prod.rating || 4.8,
        prod.reviewCount || 1,
        prod.image || '/assets/images/cat_dryfruits.jpg',
        JSON.stringify(prod.galleryImages || []),
        prod.origin || 'India',
        prod.ingredients || '',
        JSON.stringify(prod.nutritionFacts || {}),
        prod.storageInstructions || '',
        JSON.stringify(prod.specifications || {}),
        prod.allowCustomWeight !== false,
        !!prod.isFeatured,
        !!prod.isBestSeller,
      ]);

      // Add default variant if not passed
      const variants = prod.variants && prod.variants.length > 0 ? prod.variants : [
        { id: `v_${Date.now()}_250`, weightInGrams: 250, unit: 'GM', title: '250 GM', price: 250, originalPrice: 300, stockQuantity: 50, sku: 'NEW-250G' }
      ];

      for (const v of variants) {
        await db.query(`
          INSERT INTO product_variants (id, product_id, weight_in_grams, unit, title, price, original_price, stock_quantity, sku)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          v.id || `v_${Date.now()}`,
          prodId,
          v.weightInGrams || 250,
          v.unit || 'GM',
          v.title || `${v.weightInGrams || 250} GM`,
          v.price || 100,
          v.originalPrice || v.price || 120,
          v.stockQuantity || 50,
          v.sku || '',
        ]);
      }

      const fullProd = await exports.getProductById({ params: { id: prodId } }, { json: (d) => d });
      return res.status(201).json(fullProd);
    } else {
      const fb = db.getFallbackDb();
      const catPrefix = (prod.categoryId?.includes('spice') || prod.categoryName?.includes('Whole')) ? 'WS'
        : (prod.categoryId?.includes('blend') || prod.categoryName?.includes('Blend')) ? 'BS'
        : (prod.categoryId?.includes('cereal') || prod.categoryName?.includes('Cereal')) ? 'CR'
        : 'DF';
      const subPrefix = String(prod.subcategoryName || prod.subcategoryId || prod.name || 'PRD').replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'PRD';
      const autoSku = prod.sku || `${catPrefix}-${subPrefix}-${Math.floor(100 + Math.random() * 900)}`;
      const autoBarcode = prod.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`;

      const variants = (prod.variants || [
        { id: `v_${Date.now()}`, weightInGrams: 250, unit: 'GM', title: '250 GM', price: 250, originalPrice: 300, stockQuantity: 50, sku: `${autoSku}-250G`, isAvailable: true }
      ]).map((v, i) => ({
        ...v,
        sku: v.sku || `${autoSku}-${v.weightInGrams || (i + 1) * 250}G`,
        barcode: v.barcode || `${autoBarcode.slice(0, -3)}${String(v.weightInGrams || (i + 1) * 100).padStart(3, '0')}`,
      }));

      const newProduct = {
        id: prodId,
        rating: 4.8,
        reviewCount: 1,
        ...prod,
        sku: autoSku,
        barcode: autoBarcode,
        variants,
      };
      fb.products.push(newProduct);
      db.saveFallbackDb(fb);
      return res.status(201).json(newProduct);
    }
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (db.isPostgresConnected()) {
      const q = `
        UPDATE products
        SET name = COALESCE($1, name),
            brand = COALESCE($2, brand),
            category_id = COALESCE($3, category_id),
            category_name = COALESCE($4, category_name),
            subcategoryId = COALESCE($5, subcategory_id),
            subcategoryName = COALESCE($6, subcategory_name),
            short_description = COALESCE($7, short_description),
            description = COALESCE($8, description),
            image = COALESCE($9, image),
            origin = COALESCE($10, origin),
            is_featured = COALESCE($11, is_featured),
            is_best_seller = COALESCE($12, is_best_seller),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
        RETURNING *
      `;
      const result = await db.query(q, [
        body.name,
        body.brand,
        body.categoryId,
        body.categoryName,
        body.subcategoryId,
        body.subcategoryName,
        body.shortDescription,
        body.description,
        body.image,
        body.origin,
        body.isFeatured,
        body.isBestSeller,
        id,
      ]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.json(mapProductRow(result.rows[0]));
    } else {
      const fb = db.getFallbackDb();
      const idx = fb.products.findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      fb.products[idx] = { ...fb.products[idx], ...body };
      db.saveFallbackDb(fb);
      return res.json(fb.products[idx]);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (db.isPostgresConnected()) {
      await db.query('DELETE FROM products WHERE id = $1', [id]);
    } else {
      const fb = db.getFallbackDb();
      fb.products = fb.products.filter((p) => p.id !== id);
      db.saveFallbackDb(fb);
    }
    return res.json({ success: true, message: 'Product and variants deleted' });
  } catch (err) {
    next(err);
  }
};

// Weight Variant Endpoints
exports.addVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const v = req.body;
    const vId = v.id || `v_${Date.now()}`;

    if (db.isPostgresConnected()) {
      const q = `
        INSERT INTO product_variants (id, product_id, weight_in_grams, unit, title, price, original_price, stock_quantity, sku, is_available)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const result = await db.query(q, [
        vId,
        productId,
        v.weightInGrams,
        v.unit || 'GM',
        v.title,
        v.price,
        v.originalPrice || v.price,
        v.stockQuantity || 50,
        v.sku || '',
        v.isAvailable !== false,
      ]);
      return res.status(201).json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      const prod = fb.products.find((p) => p.id === productId);
      if (!prod) return res.status(404).json({ error: 'Product not found' });
      const newV = { id: vId, ...v, isAvailable: v.isAvailable !== false };
      prod.variants.push(newV);
      db.saveFallbackDb(fb);
      return res.status(201).json(newV);
    }
  } catch (err) {
    next(err);
  }
};

exports.updateVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const v = req.body;

    if (db.isPostgresConnected()) {
      const q = `
        UPDATE product_variants
        SET weight_in_grams = COALESCE($1, weight_in_grams),
            unit = COALESCE($2, unit),
            title = COALESCE($3, title),
            price = COALESCE($4, price),
            original_price = COALESCE($5, original_price),
            stock_quantity = COALESCE($6, stock_quantity),
            sku = COALESCE($7, sku),
            is_available = COALESCE($8, is_available),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9 AND product_id = $10
        RETURNING *
      `;
      const result = await db.query(q, [
        v.weightInGrams,
        v.unit,
        v.title,
        v.price,
        v.originalPrice,
        v.stockQuantity,
        v.sku,
        v.isAvailable,
        variantId,
        productId,
      ]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Variant not found' });
      return res.json(result.rows[0]);
    } else {
      const fb = db.getFallbackDb();
      const prod = fb.products.find((p) => p.id === productId);
      if (!prod) return res.status(404).json({ error: 'Product not found' });
      const vIdx = prod.variants.findIndex((item) => item.id === variantId);
      if (vIdx === -1) return res.status(404).json({ error: 'Variant not found' });
      prod.variants[vIdx] = { ...prod.variants[vIdx], ...v };
      db.saveFallbackDb(fb);
      return res.json(prod.variants[vIdx]);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    if (db.isPostgresConnected()) {
      await db.query('DELETE FROM product_variants WHERE id = $1 AND product_id = $2', [variantId, productId]);
    } else {
      const fb = db.getFallbackDb();
      const prod = fb.products.find((p) => p.id === productId);
      if (prod) {
        prod.variants = prod.variants.filter((v) => v.id !== variantId);
        db.saveFallbackDb(fb);
      }
    }
    return res.json({ success: true, message: 'Variant deleted' });
  } catch (err) {
    next(err);
  }
};

// Helper to map DB row to client JSON model
function mapProductRow(r) {
  const prodSku = r.sku || (r.variants && r.variants[0]?.sku) || `DF-${(r.id || '').toUpperCase().slice(0, 8)}`;
  const prodBarcode = r.barcode || `8907${String(Math.abs(prodSku.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0))).slice(0, 8).padStart(8, '0')}`;

  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    sku: prodSku,
    barcode: prodBarcode,
    categoryId: r.category_id,
    categoryName: r.category_name,
    subcategoryId: r.subcategory_id,
    subcategoryName: r.subcategory_name,
    shortDescription: r.short_description,
    description: r.description,
    rating: parseFloat(r.rating) || 4.8,
    reviewCount: parseInt(r.review_count, 10) || 0,
    image: r.image,
    galleryImages: typeof r.gallery_images === 'string' ? JSON.parse(r.gallery_images) : r.gallery_images || [],
    origin: r.origin,
    ingredients: r.ingredients,
    nutritionFacts: typeof r.nutrition_facts === 'string' ? JSON.parse(r.nutrition_facts) : r.nutrition_facts || {},
    storageInstructions: r.storage_instructions,
    specifications: typeof r.specifications === 'string' ? JSON.parse(r.specifications) : r.specifications || {},
    allowCustomWeight: r.allow_custom_weight,
    isFeatured: r.is_featured,
    isBestSeller: r.is_best_seller,
    isTrending: r.is_trending,
    isSpecialOffer: r.is_special_offer,
    isNewArrival: r.is_new_arrival,
    variants: r.variants || [],
  };
}

