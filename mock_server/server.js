const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '..', 'customer_app', 'assets')));

// Helper to read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return null;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db:', err);
    return null;
  }
}

// Helper to write DB
function writeDb(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing db:', err);
    return false;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Categories
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db ? db.categories : []);
});

app.post('/api/categories', (req, res) => {
  const db = readDb();
  const newCat = { id: `cat_${Date.now()}`, ...req.body };
  db.categories.push(newCat);
  writeDb(db);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
  const db = readDb();
  const idx = db.categories.findIndex(c => c.id === req.params.id);
  if (idx !== -1) {
    db.categories[idx] = { ...db.categories[idx], ...req.body };
    writeDb(db);
    res.json(db.categories[idx]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  const db = readDb();
  db.categories = db.categories.filter(c => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Products
app.get('/api/products', (req, res) => {
  const db = readDb();
  let products = db ? db.products : [];
  const { category, subcategory, search, featured, bestSeller } = req.query;

  if (category) {
    products = products.filter(p => p.categoryId === category);
  }
  if (subcategory) {
    products = products.filter(p => p.subcategoryId === subcategory);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.shortDescription.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  }
  if (featured === 'true') {
    products = products.filter(p => p.isFeatured);
  }
  if (bestSeller === 'true') {
    products = products.filter(p => p.isBestSeller);
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  const db = readDb();
  const newProduct = {
    id: `prod_${Date.now()}`,
    rating: 4.8,
    reviewCount: 1,
    ...req.body
  };
  db.products.push(newProduct);
  writeDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDb();
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    db.products[idx] = { ...db.products[idx], ...req.body };
    writeDb(db);
    res.json(db.products[idx]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  db.products = db.products.filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Product Variant updates
app.put('/api/products/:productId/variants/:variantId', (req, res) => {
  const db = readDb();
  const product = db.products.find(p => p.id === req.params.productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const vIdx = product.variants.findIndex(v => v.id === req.params.variantId);
  if (vIdx === -1) return res.status(404).json({ error: 'Variant not found' });

  product.variants[vIdx] = { ...product.variants[vIdx], ...req.body };
  writeDb(db);
  res.json(product.variants[vIdx]);
});

// Orders
app.get('/api/orders', (req, res) => {
  const db = readDb();
  res.json(db ? db.orders : []);
});

app.post('/api/orders', (req, res) => {
  const db = readDb();
  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: 'Pending',
    ...req.body
  };
  
  // Deduct inventory
  if (newOrder.items && Array.isArray(newOrder.items)) {
    for (const item of newOrder.items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod && prod.variants) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant && variant.stockQuantity >= item.quantity) {
          variant.stockQuantity -= item.quantity;
        }
      }
    }
  }

  db.orders.unshift(newOrder);
  writeDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDb();
  const order = db.orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    order.updatedAt = new Date().toISOString();
    writeDb(db);
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Customers
app.get('/api/customers', (req, res) => {
  const db = readDb();
  res.json(db ? db.customers : []);
});

// Coupons
app.get('/api/coupons', (req, res) => {
  const db = readDb();
  res.json(db ? db.coupons : []);
});

app.post('/api/coupons', (req, res) => {
  const db = readDb();
  const newCoupon = { id: `cpn_${Date.now()}`, ...req.body };
  db.coupons.push(newCoupon);
  writeDb(db);
  res.status(201).json(newCoupon);
});

// Banners
app.get('/api/banners', (req, res) => {
  const db = readDb();
  res.json(db ? db.banners : []);
});

app.post('/api/banners', (req, res) => {
  const db = readDb();
  const newBanner = { id: `bnr_${Date.now()}`, ...req.body };
  db.banners.push(newBanner);
  writeDb(db);
  res.status(201).json(newBanner);
});

// Store Settings
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db ? db.settings : {});
});

app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json(db.settings);
});

// Admin Auth
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@naturale.com' && password === 'admin123') {
    res.json({
      token: 'jwt_mock_admin_token_naturale_2026',
      user: {
        name: 'Store Manager',
        email: 'admin@naturale.com',
        role: 'SUPER_ADMIN'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials. Demo: admin@naturale.com / admin123' });
  }
});

app.listen(PORT, () => {
  console.log(`Dryfruits Mock API Server running at http://localhost:${PORT}`);
});

