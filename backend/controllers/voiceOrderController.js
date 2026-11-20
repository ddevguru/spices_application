const db = require('../config/db');

// Helper to normalize Indian phone number to 10 digits
function normalizePhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Helper to fetch all products with variants
async function fetchAllCatalogProducts() {
  if (db.isPostgresConnected()) {
    try {
      const q = `
        SELECT p.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pv.id,
                'weightInGrams', pv.weight_in_grams,
                'unit', pv.unit,
                'title', pv.title,
                'price', pv.price::float,
                'originalPrice', pv.original_price::float,
                'stockQuantity', pv.stock_quantity,
                'sku', pv.sku,
                'isAvailable', pv.is_available
              ) ORDER BY pv.weight_in_grams ASC
            ) FILTER (WHERE pv.id IS NOT NULL), '[]'::json
          ) as variants
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        GROUP BY p.id
      `;
      const res = await db.query(q);
      return res.rows.map(r => ({
        id: r.id,
        name: r.name,
        brand: r.brand,
        categoryId: r.category_id,
        categoryName: r.category_name,
        subcategoryId: r.subcategory_id,
        subcategoryName: r.subcategory_name,
        shortDescription: r.short_description,
        description: r.description,
        image: r.image,
        variants: r.variants || []
      }));
    } catch (e) {
      console.warn('Postgres fetch catalog products error:', e.message);
    }
  }
  const fb = db.getFallbackDb();
  return fb.products || [];
}

// 1. Get Main Categories
exports.getCatalogueCategories = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = `SELECT id, name, slug, image, description, subcategories, is_active FROM categories WHERE is_active = true ORDER BY display_order ASC`;
      const result = await db.query(q);
      const categories = result.rows.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        image: r.image,
        description: r.description,
        subcategories: typeof r.subcategories === 'string' ? JSON.parse(r.subcategories) : (r.subcategories || [])
      }));
      return res.json({ success: true, data: categories });
    } else {
      const fb = db.getFallbackDb();
      const list = (fb.categories || []).filter(c => c.isActive !== false).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        description: c.description,
        subcategories: c.subcategories || []
      }));
      return res.json({ success: true, data: list });
    }
  } catch (err) {
    next(err);
  }
};

// 2. Get Subcategories
exports.getCatalogueSubcategories = async (req, res, next) => {
  try {
    const { categoryId, category } = req.query;
    let categories = [];

    if (db.isPostgresConnected()) {
      const q = `SELECT id, name, subcategories FROM categories WHERE is_active = true`;
      const result = await db.query(q);
      categories = result.rows.map(r => ({
        id: r.id,
        name: r.name,
        subcategories: typeof r.subcategories === 'string' ? JSON.parse(r.subcategories) : (r.subcategories || [])
      }));
    } else {
      const fb = db.getFallbackDb();
      categories = fb.categories || [];
    }

    if (categoryId || category) {
      const target = (categoryId || category).toLowerCase();
      const found = categories.find(c => c.id.toLowerCase() === target || c.name.toLowerCase() === target);
      return res.json({
        success: true,
        categoryId: found?.id || categoryId,
        categoryName: found?.name || category,
        subcategories: found?.subcategories || []
      });
    }

    // If no category specified, return mapped object of all categories and their subcategories
    const all = {};
    for (const c of categories) {
      all[c.name] = c.subcategories || [];
    }
    return res.json({ success: true, data: all });
  } catch (err) {
    next(err);
  }
};

// 3. Get Product Varieties (filtered by category and/or subcategory)
exports.getCatalogueProducts = async (req, res, next) => {
  try {
    const { categoryId, subcategoryId, category, subcategory, search } = req.query;
    const allProducts = await fetchAllCatalogProducts();

    let filtered = allProducts;

    const catTarget = (categoryId || category || '').toLowerCase().trim();
    if (catTarget && catTarget !== 'all') {
      filtered = filtered.filter(p => 
        (p.categoryId && p.categoryId.toLowerCase() === catTarget) ||
        (p.categoryName && p.categoryName.toLowerCase() === catTarget)
      );
    }

    const subTarget = (subcategoryId || subcategory || '').toLowerCase().trim();
    if (subTarget && subTarget !== 'all') {
      filtered = filtered.filter(p => {
        const sub = (p.subcategoryId || p.subcategoryName || '').toLowerCase();
        return sub.includes(subTarget) || p.name.toLowerCase().includes(subTarget);
      });
    }

    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
      );
    }

    const simplified = filtered.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      subcategoryId: p.subcategoryId,
      subcategoryName: p.subcategoryName,
      shortDescription: p.shortDescription,
      image: p.image,
      startingPrice: p.variants && p.variants.length > 0 ? p.variants[0].price : 0,
      variantsCount: p.variants ? p.variants.length : 0
    }));

    return res.json({
      success: true,
      count: simplified.length,
      data: simplified
    });
  } catch (err) {
    next(err);
  }
};

// 4. Get Weight Variants for a selected Product Variety
exports.getCatalogueVariants = async (req, res, next) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId query parameter is required' });
    }

    const allProducts = await fetchAllCatalogProducts();
    const product = allProducts.find(p => p.id === productId || p.id.toLowerCase() === productId.toLowerCase());

    if (!product) {
      return res.status(404).json({ success: false, error: `Product '${productId}' not found in catalogue` });
    }

    return res.json({
      success: true,
      productId: product.id,
      productName: product.name,
      categoryName: product.categoryName,
      subcategoryId: product.subcategoryId,
      variants: product.variants || []
    });
  } catch (err) {
    next(err);
  }
};

// 5. Check Product Availability & Stock
exports.checkProductAvailability = async (req, res, next) => {
  try {
    const { variantId, quantity } = req.query;
    const reqQty = parseInt(quantity || '1', 10);

    if (!variantId) {
      return res.status(400).json({ success: false, error: 'variantId is required' });
    }

    const allProducts = await fetchAllCatalogProducts();
    let foundVariant = null;
    let parentProduct = null;

    for (const p of allProducts) {
      const v = (p.variants || []).find(v => v.id === variantId);
      if (v) {
        foundVariant = v;
        parentProduct = p;
        break;
      }
    }

    if (!foundVariant) {
      return res.status(404).json({ success: false, error: 'Variant not found' });
    }

    const isAvailable = foundVariant.isAvailable !== false && foundVariant.stockQuantity >= reqQty;

    return res.json({
      success: true,
      variantId: foundVariant.id,
      title: foundVariant.title,
      productName: parentProduct.name,
      stockQuantity: foundVariant.stockQuantity,
      requestedQuantity: reqQty,
      isAvailable,
      unitPrice: foundVariant.price,
      totalPrice: foundVariant.price * reqQty
    });
  } catch (err) {
    next(err);
  }
};

// 6. Customer Recognition / Lookup by Phone Number
exports.lookupCustomerByPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'phone query parameter is required' });
    }

    const cleanPhone = normalizePhoneNumber(phone);

    if (db.isPostgresConnected()) {
      const q = `
        SELECT c.*,
          COALESCE(
            (SELECT json_agg(json_build_object('id', o.id, 'createdAt', o.created_at, 'totalAmount', o.total_amount, 'status', o.status))
             FROM orders o WHERE o.customer_id = c.id OR o.customer_phone LIKE '%' || $1
             LIMIT 3), '[]'::json
          ) as recent_orders
        FROM customers c
        WHERE c.phone LIKE '%' || $1 OR c.id LIKE '%' || $1
        LIMIT 1
      `;
      const result = await db.query(q, [cleanPhone]);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        const addrList = typeof row.addresses === 'string' ? JSON.parse(row.addresses) : (row.addresses || []);
        const primaryAddr = addrList[0] || {
          street: '',
          city: row.city || '',
          state: 'Maharashtra',
          pincode: ''
        };

        return res.json({
          success: true,
          isRegistered: true,
          customer: {
            id: row.id,
            name: row.name,
            businessName: row.business_name || row.shop_name || '',
            gstNumber: row.gst_number || '',
            phone: row.phone || cleanPhone,
            email: row.email || '',
            city: row.city || primaryAddr.city || '',
            address: primaryAddr,
            addresses: addrList,
            totalOrders: row.total_orders || 0,
            totalSpent: parseFloat(row.total_spent) || 0,
            recentOrders: row.recent_orders || []
          }
        });
      }
    } else {
      const fb = db.getFallbackDb();
      const customers = fb.customers || [];
      const found = customers.find(c => {
        const p = normalizePhoneNumber(c.phone || c.mobile || '');
        return p && p.includes(cleanPhone);
      });

      if (found) {
        return res.json({
          success: true,
          isRegistered: true,
          customer: {
            id: found.id,
            name: found.name,
            businessName: found.businessName || found.shopName || '',
            gstNumber: found.gstNumber || '',
            phone: found.phone || found.mobile || cleanPhone,
            email: found.email || '',
            city: found.city || '',
            address: {
              street: found.address?.street || '',
              city: found.city || found.address?.city || '',
              state: found.address?.state || 'Maharashtra',
              pincode: found.address?.pincode || ''
            },
            totalOrders: found.totalOrders || 0,
            totalSpent: found.totalSpent || 0
          }
        });
      }
    }

    return res.json({
      success: true,
      isRegistered: false,
      phone: cleanPhone,
      message: 'New customer (no previous order history)'
    });
  } catch (err) {
    next(err);
  }
};

// 7. Start Call Session Log
exports.startCallSession = async (req, res, next) => {
  try {
    const { call_id, caller_phone, customer_name, business_name } = req.body;
    const callId = call_id || `call_${Date.now()}`;
    const cleanPhone = normalizePhoneNumber(caller_phone) || caller_phone || '9820012345';

    if (db.isPostgresConnected()) {
      await db.query(`
        INSERT INTO voice_calls (id, caller_phone, customer_name, business_name, start_time, status)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'in_progress')
        ON CONFLICT (id) DO UPDATE SET
          caller_phone = EXCLUDED.caller_phone,
          customer_name = COALESCE(EXCLUDED.customer_name, voice_calls.customer_name),
          business_name = COALESCE(EXCLUDED.business_name, voice_calls.business_name);
      `, [callId, cleanPhone, customer_name || null, business_name || null]);
    } else {
      const fb = db.getFallbackDb();
      fb.voice_calls = fb.voice_calls || [];
      const idx = fb.voice_calls.findIndex(c => c.id === callId);
      const callData = {
        id: callId,
        callerPhone: cleanPhone,
        customerName: customer_name || null,
        businessName: business_name || null,
        startTime: new Date().toISOString(),
        status: 'in_progress'
      };
      if (idx !== -1) fb.voice_calls[idx] = { ...fb.voice_calls[idx], ...callData };
      else fb.voice_calls.unshift(callData);
      db.saveFallbackDb(fb);
    }

    return res.status(201).json({ success: true, callId, status: 'in_progress' });
  } catch (err) {
    next(err);
  }
};

// 8. End Call Session Log
exports.endCallSession = async (req, res, next) => {
  try {
    const { call_id, duration_seconds, status, transcript, recording_url, requires_human_intervention, draft_order_id } = req.body;
    if (!call_id) {
      return res.status(400).json({ success: false, error: 'call_id is required' });
    }

    const finalStatus = status || 'completed';
    const duration = parseInt(duration_seconds || '0', 10);
    const humanHelp = Boolean(requires_human_intervention);

    if (db.isPostgresConnected()) {
      await db.query(`
        UPDATE voice_calls
        SET end_time = CURRENT_TIMESTAMP,
            duration_seconds = $1,
            status = $2,
            transcript = COALESCE($3, transcript),
            recording_url = COALESCE($4, recording_url),
            requires_human_intervention = $5,
            draft_order_id = COALESCE($6, draft_order_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7;
      `, [duration, finalStatus, transcript || null, recording_url || null, humanHelp, draft_order_id || null, call_id]);
    } else {
      const fb = db.getFallbackDb();
      fb.voice_calls = fb.voice_calls || [];
      const item = fb.voice_calls.find(c => c.id === call_id);
      if (item) {
        item.endTime = new Date().toISOString();
        item.durationSeconds = duration;
        item.status = finalStatus;
        if (transcript) item.transcript = transcript;
        if (recording_url) item.recordingUrl = recording_url;
        item.requiresHumanIntervention = humanHelp;
        if (draft_order_id) item.draftOrderId = draft_order_id;
        db.saveFallbackDb(fb);
      }
    }

    return res.json({ success: true, callId: call_id, status: finalStatus });
  } catch (err) {
    next(err);
  }
};

// 9. Create AI-Generated Draft Order (Strict Server-Side Pricing, Validation & Idempotency)
exports.createDraftOrder = async (req, res, next) => {
  try {
    const {
      call_id,
      customer,
      delivery,
      items,
      delivery_instructions,
      source
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Draft order must include at least one item in items array' });
    }

    const callId = call_id || `call_${Date.now()}`;

    // 1. Idempotency Check: Prevent duplicate drafts for the same call event
    if (db.isPostgresConnected()) {
      const existingRes = await db.query(`SELECT * FROM voice_order_drafts WHERE call_id = $1 LIMIT 1`, [callId]);
      if (existingRes.rows.length > 0) {
        return res.json({
          success: true,
          message: 'Existing draft order retrieved (idempotency key matched)',
          draft: existingRes.rows[0],
          isExisting: true
        });
      }
    } else {
      const fb = db.getFallbackDb();
      fb.voice_order_drafts = fb.voice_order_drafts || [];
      const existingDraft = fb.voice_order_drafts.find(d => d.call_id === callId);
      if (existingDraft) {
        return res.json({
          success: true,
          message: 'Existing draft order retrieved (idempotency key matched)',
          draft: existingDraft,
          isExisting: true
        });
      }
    }

    // 2. Fetch all products from DB for authoritative price and catalog validation
    const allProducts = await fetchAllCatalogProducts();

    // 3. Authoritative Line Item Validation & Price Calculation
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodId = item.product_id || item.productId;
      const varId = item.variant_id || item.variantId;
      const qty = Math.max(1, parseInt(item.quantity || '1', 10));

      const matchedProduct = allProducts.find(p => p.id === prodId || (prodId && p.id.toLowerCase() === prodId.toLowerCase()));
      if (!matchedProduct) {
        return res.status(400).json({
          success: false,
          error: `Product with ID '${prodId}' does not exist in NATURALE catalogue. Rejecting draft.`
        });
      }

      // Find variant
      let matchedVariant = null;
      if (varId) {
        matchedVariant = (matchedProduct.variants || []).find(v => v.id === varId || v.id.toLowerCase() === varId.toLowerCase());
      }
      if (!matchedVariant && matchedProduct.variants && matchedProduct.variants.length > 0) {
        matchedVariant = matchedProduct.variants[0];
      }

      if (!matchedVariant) {
        return res.status(400).json({
          success: false,
          error: `Product '${matchedProduct.name}' has no available weight variants.`
        });
      }

      const authoritativePrice = Number(matchedVariant.price);
      const lineTotal = authoritativePrice * qty;
      subtotal += lineTotal;

      validatedItems.push({
        productId: matchedProduct.id,
        productName: matchedProduct.name,
        categoryId: matchedProduct.categoryId,
        categoryName: matchedProduct.categoryName,
        subcategoryId: matchedProduct.subcategoryId,
        subcategoryName: matchedProduct.subcategoryName,
        variantId: matchedVariant.id,
        variantTitle: matchedVariant.title,
        weightInGrams: matchedVariant.weightInGrams,
        unit: matchedVariant.unit,
        price: authoritativePrice,
        originalPrice: matchedVariant.originalPrice,
        quantity: qty,
        total: lineTotal,
        image: matchedProduct.image || '/assets/images/cat_dryfruits.jpg'
      });
    }

    // 4. Server-Side Calculations for Discounts, Delivery and Taxes
    let discount = 0;
    // Example wholesale discount rule: If subtotal >= 5000, 5% wholesale discount
    if (subtotal >= 5000) {
      discount = Math.round(subtotal * 0.05);
    }

    // Delivery fee rule: Free delivery for wholesale orders >= 2000, otherwise flat 100
    const deliveryFee = subtotal >= 2000 ? 0 : 100;
    const tax = 0; // Wholesale spices & dry fruits in APMC wholesale trade
    const grandTotal = Math.max(0, subtotal - discount + deliveryFee + tax);

    // 5. Structure Customer and Delivery Information
    const custName = (customer?.name || 'Customer').trim();
    const custPhone = normalizePhoneNumber(customer?.phone) || '9820012345';
    const custBiz = (customer?.business_name || customer?.businessName || '').trim();
    const custGst = (customer?.gst_number || customer?.gstNumber || '').trim().toUpperCase();
    const custEmail = (customer?.email || `${custPhone}@store.naturale.com`).trim().toLowerCase();

    const shippingAddress = {
      street: delivery?.address || delivery?.street || 'APMC Market Area',
      area: delivery?.area || custBiz || 'Commercial Hub',
      city: delivery?.city || 'Navi Mumbai',
      state: delivery?.state || 'Maharashtra',
      pincode: delivery?.pincode || '400705'
    };

    const draftId = `draft_${Date.now()}`;

    const draftRecord = {
      id: draftId,
      call_id: callId,
      source: source || 'ai_voice',
      customer_name: custName,
      customer_phone: custPhone,
      customer_email: custEmail,
      business_name: custBiz,
      gst_number: custGst,
      shipping_address: shippingAddress,
      delivery_instructions: delivery_instructions || '',
      items: validatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      delivery_fee: parseFloat(deliveryFee.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total_amount: parseFloat(grandTotal.toFixed(2)),
      status: 'pending_admin_review',
      created_at: new Date().toISOString()
    };

    // 6. Persist Draft in Database
    if (db.isPostgresConnected()) {
      await db.query(`
        INSERT INTO voice_order_drafts (
          id, call_id, source, customer_name, customer_phone, customer_email,
          business_name, gst_number, shipping_address, delivery_instructions,
          items, subtotal, discount, delivery_fee, tax, total_amount, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        draftId,
        callId,
        draftRecord.source,
        custName,
        custPhone,
        custEmail,
        custBiz,
        custGst,
        JSON.stringify(shippingAddress),
        delivery_instructions || '',
        JSON.stringify(validatedItems),
        subtotal,
        discount,
        deliveryFee,
        tax,
        grandTotal,
        'pending_admin_review'
      ]);

      // Link to call
      await db.query(`UPDATE voice_calls SET draft_order_id = $1 WHERE id = $2`, [draftId, callId]);
    } else {
      const fb = db.getFallbackDb();
      fb.voice_order_drafts = fb.voice_order_drafts || [];
      fb.voice_order_drafts.unshift(draftRecord);
      if (fb.voice_calls) {
        const c = fb.voice_calls.find(call => call.id === callId);
        if (c) c.draftOrderId = draftId;
      }
      db.saveFallbackDb(fb);
    }

    return res.status(201).json({
      success: true,
      message: 'AI Voice Draft Order created successfully (Pending Admin Review)',
      draft: draftRecord
    });
  } catch (err) {
    next(err);
  }
};

// 10. Get All Draft Orders (For Admin Review Dashboard)
exports.getDraftOrders = async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const maxLimit = parseInt(limit || '50', 10);

    if (db.isPostgresConnected()) {
      let q = `SELECT * FROM voice_order_drafts WHERE 1=1`;
      const params = [];
      if (status && status !== 'all') {
        params.push(status);
        q += ` AND status = $${params.length}`;
      }
      q += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(maxLimit);

      const result = await db.query(q, params);
      const drafts = result.rows.map(r => ({
        id: r.id,
        callId: r.call_id,
        source: r.source,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email,
        businessName: r.business_name,
        gstNumber: r.gst_number,
        shippingAddress: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : (r.shipping_address || {}),
        deliveryInstructions: r.delivery_instructions,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
        subtotal: parseFloat(r.subtotal),
        discount: parseFloat(r.discount),
        deliveryFee: parseFloat(r.delivery_fee),
        tax: parseFloat(r.tax),
        totalAmount: parseFloat(r.total_amount),
        status: r.status,
        orderId: r.order_id,
        createdAt: r.created_at
      }));

      return res.json({ success: true, count: drafts.length, data: drafts });
    } else {
      const fb = db.getFallbackDb();
      let drafts = fb.voice_order_drafts || [];
      if (status && status !== 'all') {
        drafts = drafts.filter(d => d.status === status);
      }
      return res.json({ success: true, count: drafts.length, data: drafts.slice(0, maxLimit) });
    }
  } catch (err) {
    next(err);
  }
};

// 11. Get Draft Order by ID
exports.getDraftOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (db.isPostgresConnected()) {
      const result = await db.query(`SELECT * FROM voice_order_drafts WHERE id = $1 LIMIT 1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Draft order not found' });
      }
      const r = result.rows[0];
      return res.json({
        success: true,
        data: {
          id: r.id,
          callId: r.call_id,
          source: r.source,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          customerEmail: r.customer_email,
          businessName: r.business_name,
          gstNumber: r.gst_number,
          shippingAddress: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : (r.shipping_address || {}),
          deliveryInstructions: r.delivery_instructions,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []),
          subtotal: parseFloat(r.subtotal),
          discount: parseFloat(r.discount),
          deliveryFee: parseFloat(r.delivery_fee),
          tax: parseFloat(r.tax),
          totalAmount: parseFloat(r.total_amount),
          status: r.status,
          orderId: r.order_id,
          createdAt: r.created_at
        }
      });
    } else {
      const fb = db.getFallbackDb();
      const draft = (fb.voice_order_drafts || []).find(d => d.id === id);
      if (!draft) return res.status(404).json({ success: false, error: 'Draft order not found' });
      return res.json({ success: true, data: draft });
    }
  } catch (err) {
    next(err);
  }
};

// 12. Get Voice Calling Dashboard Metrics & Call History Log
exports.getVoiceDashboardMetrics = async (req, res, next) => {
  try {
    let totalCalls = 0;
    let successfulCalls = 0;
    let failedCalls = 0;
    let draftOrdersCount = 0;
    let awaitingReviewCount = 0;
    let humanInterventionCount = 0;
    let callsList = [];

    if (db.isPostgresConnected()) {
      const callCountRes = await db.query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'completed')::int as successful,
          COUNT(*) FILTER (WHERE status IN ('failed', 'incomplete'))::int as failed,
          COUNT(*) FILTER (WHERE requires_human_intervention = true)::int as human_help
        FROM voice_calls
      `);
      if (callCountRes.rows.length > 0) {
        totalCalls = callCountRes.rows[0].total || 0;
        successfulCalls = callCountRes.rows[0].successful || 0;
        failedCalls = callCountRes.rows[0].failed || 0;
        humanInterventionCount = callCountRes.rows[0].human_help || 0;
      }

      const draftCountRes = await db.query(`
        SELECT 
          COUNT(*)::int as total_drafts,
          COUNT(*) FILTER (WHERE status = 'pending_admin_review')::int as awaiting_review
        FROM voice_order_drafts
      `);
      if (draftCountRes.rows.length > 0) {
        draftOrdersCount = draftCountRes.rows[0].total_drafts || 0;
        awaitingReviewCount = draftCountRes.rows[0].awaiting_review || 0;
      }

      const recentCallsRes = await db.query(`
        SELECT vc.*, vod.id as draft_id, vod.total_amount as draft_total
        FROM voice_calls vc
        LEFT JOIN voice_order_drafts vod ON vc.id = vod.call_id
        ORDER BY vc.created_at DESC
        LIMIT 20
      `);
      callsList = recentCallsRes.rows.map(r => ({
        id: r.id,
        callerPhone: r.caller_phone,
        customerName: r.customer_name || 'Customer',
        businessName: r.business_name || '',
        startTime: r.start_time,
        endTime: r.end_time,
        durationSeconds: r.duration_seconds || 0,
        status: r.status,
        transcript: r.transcript || '',
        recordingUrl: r.recording_url || null,
        draftOrderId: r.draft_id || r.draft_order_id || null,
        draftTotal: r.draft_total ? parseFloat(r.draft_total) : null,
        requiresHumanIntervention: r.requires_human_intervention || false
      }));
    } else {
      const fb = db.getFallbackDb();
      const calls = fb.voice_calls || [];
      const drafts = fb.voice_order_drafts || [];

      totalCalls = calls.length;
      successfulCalls = calls.filter(c => c.status === 'completed').length;
      failedCalls = calls.filter(c => c.status === 'failed' || c.status === 'incomplete').length;
      humanInterventionCount = calls.filter(c => c.requiresHumanIntervention).length;
      draftOrdersCount = drafts.length;
      awaitingReviewCount = drafts.filter(d => d.status === 'pending_admin_review').length;
      callsList = calls.slice(0, 20);
    }

    return res.json({
      success: true,
      metrics: {
        totalCalls,
        successfulCalls,
        failedCalls,
        draftOrdersGenerated: draftOrdersCount,
        ordersAwaitingReview: awaitingReviewCount,
        callsRequiringHumanIntervention: humanInterventionCount
      },
      calls: callsList
    });
  } catch (err) {
    next(err);
  }
};

// 13. Convert Draft Order to Confirmed Order (When Admin Reviews & Confirms)
exports.convertDraftToOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { wholesaleDiscount, deliveryFee, paymentMethod, deliveryInstructions } = req.body;

    let draft = null;

    if (db.isPostgresConnected()) {
      const draftRes = await db.query(`SELECT * FROM voice_order_drafts WHERE id = $1 LIMIT 1`, [id]);
      if (draftRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Draft order not found' });
      }
      draft = draftRes.rows[0];
      if (draft.status === 'converted_to_order') {
        return res.status(400).json({ success: false, error: 'Draft has already been converted to an order', orderId: draft.order_id });
      }
    } else {
      const fb = db.getFallbackDb();
      draft = (fb.voice_order_drafts || []).find(d => d.id === id);
      if (!draft) return res.status(404).json({ success: false, error: 'Draft order not found' });
    }

    // Call existing createOrder logic from orderController
    const orderController = require('./orderController');
    const items = typeof draft.items === 'string' ? JSON.parse(draft.items) : draft.items;
    const shippingAddress = typeof draft.shipping_address === 'string' ? JSON.parse(draft.shipping_address) : (draft.shipping_address || {});

    const discountVal = wholesaleDiscount !== undefined ? Number(wholesaleDiscount) : Number(draft.discount || 0);
    const feeVal = deliveryFee !== undefined ? Number(deliveryFee) : Number(draft.delivery_fee || 0);
    const subtotalVal = Number(draft.subtotal || 0);
    const totalVal = Math.max(0, subtotalVal - discountVal + feeVal);

    const orderPayload = {
      customer: {
        name: draft.customer_name,
        businessName: draft.business_name,
        gstNumber: draft.gst_number,
        phone: draft.customer_phone,
        email: draft.customer_email || `${draft.customer_phone}@store.naturale.com`,
        address: shippingAddress
      },
      items: items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        variantId: it.variantId,
        variantTitle: it.variantTitle,
        weightInGrams: it.weightInGrams,
        price: it.price,
        quantity: it.quantity,
        image: it.image
      })),
      subtotal: subtotalVal,
      discount: discountVal,
      couponCode: discountVal > 0 ? 'WHOLESALE_DISCOUNT' : '',
      deliveryFee: feeVal,
      tax: 0,
      totalAmount: totalVal,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Paid',
      status: 'Confirmed',
      deliveryInstructions: deliveryInstructions || draft.delivery_instructions || ''
    };

    // Reuse orderController logic by invoking createOrder internally
    const mockReq = { body: orderPayload };
    let createdOrderResult = null;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          createdOrderResult = data;
          return data;
        }
      })
    };

    await orderController.createOrder(mockReq, mockRes, next);

    if (createdOrderResult && createdOrderResult.id) {
      // Mark draft as converted
      if (db.isPostgresConnected()) {
        await db.query(`UPDATE voice_order_drafts SET status = 'converted_to_order', order_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [createdOrderResult.id, id]);
      } else {
        const fb = db.getFallbackDb();
        const d = (fb.voice_order_drafts || []).find(item => item.id === id);
        if (d) {
          d.status = 'converted_to_order';
          d.orderId = createdOrderResult.id;
          db.saveFallbackDb(fb);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Draft order approved and converted into live order successfully',
        order: createdOrderResult
      });
    }

    return res.status(500).json({ success: false, error: 'Order creation did not return order object' });
  } catch (err) {
    next(err);
  }
};

