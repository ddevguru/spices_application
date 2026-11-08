const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase, getDbMode } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const couponRoutes = require('./routes/couponRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload & assets directories exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Global Middlewares
app.use(cors()); // Allow all origins, methods, and headers for seamless mobile & admin cross-origin calls
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static Folders
app.use('/uploads', express.static(uploadDir));
// Map project assets so Flutter & Admin panel can load images directly from the backend
const assetsDir = path.join(__dirname, '..', 'admin_panel', 'public', 'assets');
if (fs.existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
}

// Root & Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Naturale Dry Fruits & Spices API',
    version: '1.0.0',
    status: 'online',
    databaseMode: getDbMode ? getDbMode() : 'active',
    documentation: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    databaseMode: getDbMode ? getDbMode() : 'active',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      orders: '/api/orders',
      inventory: '/api/inventory',
      customers: '/api/customers',
      coupons: '/api/coupons',
      banners: '/api/banners',
      settings: '/api/settings',
      dashboard: '/api/dashboard/metrics',
      upload: '/api/upload'
    }
  });
});

// Product Deep-Link & Scannable QR Landing Page
app.get(['/open', '/product', '/api/product/open'], async (req, res) => {
  const db = require('./config/db');
  const sku = (req.query.sku || req.query.barcode || req.query.id || 'DF-ALM-101').trim();
  const clean = sku.toUpperCase();

  let product = null;
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
                'sku', pv.sku
              )
            ) FILTER (WHERE pv.id IS NOT NULL), '[]'::json
          ) as variants
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE UPPER(p.id) = $1 
           OR UPPER(COALESCE(p.sku, '')) = $1
           OR EXISTS (SELECT 1 FROM product_variants WHERE product_id = p.id AND UPPER(sku) = $1)
        GROUP BY p.id
        LIMIT 1
      `;
      const result = await db.query(q, [clean]);
      if (result.rows.length > 0) {
        product = result.rows[0];
      }
    } catch (_) {}
  }

  if (!product) {
    const fb = db.getFallbackDb();
    product = (fb.products || []).find(p =>
      (p.id && p.id.toUpperCase() === clean) ||
      (p.sku && p.sku.toUpperCase() === clean) ||
      (p.barcode && p.barcode === clean) ||
      (p.variants && p.variants.some(v => v.sku && v.sku.toUpperCase() === clean))
    );
  }

  const name = product ? product.name : 'Naturale Premium Product';
  const brand = product ? (product.brand || 'Naturale Royal') : 'Naturale';
  let image = (product && product.image) ? product.image : '/assets/images/onboarding_dryfruits.jpg';
  if (image && !image.startsWith('http')) {
    image = `https://dryfruits-api.onrender.com${image.startsWith('/') ? '' : '/'}${image}`;
  }
  const defaultVar = product && product.variants && product.variants[0] ? product.variants[0] : null;
  const price = defaultVar ? defaultVar.price : '123';
  const weight = defaultVar ? (defaultVar.title || `${defaultVar.weightInGrams || 100} GM`) : '100 GM';
  const category = product ? (product.category_name || product.categoryName || 'Dry Fruits') : 'Dry Fruits';
  const displaySku = (product && (product.sku || product.id)) ? (product.sku || product.id) : sku;

  const appDeepLink = `naturale://product?sku=${encodeURIComponent(displaySku)}`;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Naturale Pure Dry Fruits</title>
  <meta name="theme-color" content="#EA580C">
  <meta property="og:title" content="${name} - Naturale">
  <meta property="og:description" content="Pure premium ${name} (${weight}) available now on Naturale app.">
  <meta property="og:image" content="${image}">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #FAF5ED; color: #1F2937; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #FFFFFF; max-width: 440px; width: 100%; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #F3EAE0; }
    .header { background: #EA580C; padding: 18px 24px; color: white; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { font-size: 16px; font-weight: 800; letter-spacing: 1px; }
    .img-wrap { width: 100%; height: 260px; background: #FFF5EB; display: flex; align-items: center; justify-content: center; position: relative; }
    .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .badge { position: absolute; top: 14px; right: 14px; background: rgba(0,0,0,0.75); color: #FFF; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .body { padding: 24px; }
    .category { font-size: 12px; font-weight: 700; color: #EA580C; text-transform: uppercase; letter-spacing: 0.5px; }
    .title { font-size: 20px; font-weight: 800; margin: 6px 0 4px; color: #111827; }
    .brand { font-size: 13px; color: #6B7280; margin-bottom: 14px; }
    .price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 20px; }
    .price { font-size: 26px; font-weight: 800; color: #111827; }
    .weight { font-size: 14px; color: #6B7280; font-weight: 600; }
    .sku-pill { display: inline-block; background: #F3F4F6; color: #374151; font-family: monospace; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #E5E7EB; }
    .btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; border-radius: 14px; font-weight: 700; font-size: 15px; text-decoration: none; cursor: pointer; transition: all 0.2s ease; border: none; }
    .btn-primary { background: #EA580C; color: white; margin-bottom: 12px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35); }
    .btn-secondary { background: #F3F4F6; color: #1F2937; border: 1px solid #E5E7EB; }
    .status-banner { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 12px; border-radius: 12px; font-size: 12.5px; text-align: center; margin-bottom: 16px; font-weight: 600; }
  </style>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      // Auto-trigger deep link for mobile devices
      setTimeout(function() {
        window.location.href = "${appDeepLink}";
      }, 300);
    });
  </script>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>NATURALE PURE</h1>
      <span style="font-size: 12px; background: rgba(255,255,255,0.25); padding: 3px 8px; border-radius: 10px;">Official Product</span>
    </div>
    <div class="img-wrap">
      <img src="${image}" alt="${name}" onerror="this.src='https://dryfruits-admin.onrender.com/assets/images/onboarding_dryfruits.jpg'">
      <div class="badge">${category}</div>
    </div>
    <div class="body">
      <div class="category">${category}</div>
      <div class="title">${name}</div>
      <div class="brand">${brand}</div>

      <div class="price-row">
        <span class="price">₹${price}</span>
        <span class="weight">per ${weight}</span>
      </div>

      <div class="sku-pill">PRODUCT SKU: ${displaySku}</div>

      <div class="status-banner">
        📲 Opening Naturale Mobile App...
      </div>

      <a href="${appDeepLink}" class="btn btn-primary">
        🚀 Open in Naturale App
      </a>

      <a href="https://dryfruits-admin.onrender.com" class="btn btn-secondary">
        🏪 Explore Online Store
      </a>
    </div>
  </div>
</body>
</html>`);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Initialize Database & Start Server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🌿 NATURALE DRY FRUITS & SPICES - BACKEND API`);
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`💾 Database Mode: ${getDbMode ? getDbMode() : 'PostgreSQL'}`);
      console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start when executed directly
if (require.main === module) {
  startServer();
}

module.exports = app;

