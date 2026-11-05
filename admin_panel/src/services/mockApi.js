import axios from 'axios';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL)
  ? (import.meta.env.VITE_API_URL.startsWith('http')
      ? `${import.meta.env.VITE_API_URL}/api`
      : `https://${import.meta.env.VITE_API_URL}/api`)
  : 'https://dryfruits-api.onrender.com/api';

// Initial fallback seeds
const INITIAL_DB = {
  categories: [
    {
      id: "cat_dry_fruits",
      name: "Dry Fruits",
      slug: "dry-fruits",
      image: "/assets/images/cat_dryfruits.jpg",
      description: "Rich in essential nutrients, vitamins, and healthy fats.",
      order: 1,
      isActive: true,
      subcategories: ["Almonds", "Cashews", "Pistachios", "Walnuts", "Raisins", "Dates", "Figs", "Anjeer", "Apricots", "Mixed Dry Fruits", "Seeds & Nuts"]
    },
    {
      id: "cat_whole_spices",
      name: "Whole Spices",
      slug: "whole-spices",
      image: "/assets/images/cat_wholespices.jpg",
      description: "Aromatic, pure and hand-selected whole spices.",
      order: 2,
      isActive: true,
      subcategories: ["Green Cardamom", "Black Cardamom", "Cinnamon Sticks", "Cloves", "Black Pepper", "Cumin Seeds", "Coriander Seeds", "Fennel Seeds", "Mustard Seeds", "Star Anise", "Bay Leaves", "Fenugreek Seeds", "Dry Red Chillies"]
    },
    {
      id: "cat_blended_spices",
      name: "Blended Spices",
      slug: "blended-spices",
      image: "/assets/images/cat_blendedspices.jpg",
      description: "Authentic heritage spice blends ground to perfection.",
      order: 3,
      isActive: true,
      subcategories: ["Garam Masala", "Kitchen King Masala", "Biryani Masala", "Chole Masala", "Pav Bhaji Masala", "Paneer Masala", "Chicken Masala", "Meat Masala", "Sambhar Masala", "Tandoori Masala", "Turmeric Powder", "Red Chilli Powder", "Coriander Powder", "Cumin Powder"]
    },
    {
      id: "cat_cereals",
      name: "Cereals",
      slug: "cereals",
      image: "/assets/images/cat_cereals.jpg",
      description: "Nutritious whole grains, millets, oats and superfoods.",
      order: 4,
      isActive: true,
      subcategories: ["Oats", "Rolled Oats", "Quinoa", "Millets", "Ragi", "Jowar", "Bajra", "Barley", "Brown Rice", "Dalia", "Corn Flakes", "Muesli", "Wheat", "Multigrain Mix"]
    }
  ],
  products: [
    {
      id: "p_almonds",
      name: "California Whole Almonds",
      brand: "Naturale Pure",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Almonds",
      subcategoryName: "Almonds",
      shortDescription: "Jumbo California almonds, crisp & rich in Vitamin E.",
      description: "Our premium California almonds are carefully selected from the finest orchards. Naturally rich in protein, healthy fats, fiber, and antioxidant Vitamin E.",
      rating: 4.9,
      reviewCount: 420,
      image: "/assets/images/prod_almonds.jpg",
      origin: "California, USA",
      ingredients: "100% Pure Raw California Almonds",
      nutritionFacts: { "Energy": "579 kcal", "Protein": "21.2 g", "Fat": "49.9 g", "Fiber": "12.5 g" },
      storageInstructions: "Store in airtight jar in cool dark pantry.",
      specifications: { "Grade": "Extra No. 1 Jumbo", "Moisture": "< 6%" },
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_alm_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 120, originalPrice: 150, stockQuantity: 85, sku: "DF-ALM-100", isAvailable: true },
        { id: "v_alm_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 280, originalPrice: 350, stockQuantity: 60, sku: "DF-ALM-250", isAvailable: true },
        { id: "v_alm_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 540, originalPrice: 650, stockQuantity: 40, sku: "DF-ALM-500", isAvailable: true },
        { id: "v_alm_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1050, originalPrice: 1280, stockQuantity: 25, sku: "DF-ALM-1000", isAvailable: true }
      ]
    },
    {
      id: "p_cashews",
      name: "Royal Mangalore Cashews (W240)",
      brand: "Naturale Pure",
      categoryId: "cat_dry_fruits",
      categoryName: "Dry Fruits",
      subcategoryId: "Cashews",
      subcategoryName: "Cashews",
      shortDescription: "Whole jumbo W240 cashews, velvety, creamy & sweet.",
      description: "Graded W240 jumbo cashew nuts hand-processed in Karnataka. Sweet, buttery crunch with zero cholesterol.",
      rating: 4.8,
      reviewCount: 310,
      image: "/assets/images/prod_cashews.jpg",
      origin: "Mangalore, India",
      ingredients: "100% Whole Cashew Kernels (W240)",
      nutritionFacts: { "Energy": "553 kcal", "Protein": "18.2 g", "Fat": "43.8 g" },
      storageInstructions: "Keep sealed in glass container.",
      specifications: { "Grade": "W240 Jumbo", "Shelf Life": "9 Months" },
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_csh_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 140, originalPrice: 170, stockQuantity: 50, sku: "DF-CSH-100", isAvailable: true },
        { id: "v_csh_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 320, originalPrice: 390, stockQuantity: 45, sku: "DF-CSH-250", isAvailable: true },
        { id: "v_csh_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 620, originalPrice: 750, stockQuantity: 30, sku: "DF-CSH-500", isAvailable: true },
        { id: "v_csh_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 1190, originalPrice: 1450, stockQuantity: 18, sku: "DF-CSH-1000", isAvailable: true }
      ]
    },
    {
      id: "p_cardamom",
      name: "Idukki Green Cardamom (8mm+ Bold)",
      brand: "Naturale Spices",
      categoryId: "cat_whole_spices",
      categoryName: "Whole Spices",
      subcategoryId: "Green Cardamom",
      subcategoryName: "Green Cardamom",
      shortDescription: "Queen of spices: aromatic 8mm+ bold green pods from Kerala.",
      description: "Directly sourced from misty cardamom hills of Idukki, Kerala. Lush green pods bursting with intense aroma.",
      rating: 5.0,
      reviewCount: 192,
      image: "/assets/images/prod_cardamom.jpg",
      origin: "Idukki, Kerala, India",
      ingredients: "100% Whole Green Cardamom",
      nutritionFacts: { "Energy": "311 kcal", "Protein": "10.8 g" },
      storageInstructions: "Store in cool dark cupboard in airtight jar.",
      specifications: { "Pod Size": "8mm+ Super Bold" },
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_crd_50", weightInGrams: 50, unit: "GM", title: "50 GM", price: 180, originalPrice: 220, stockQuantity: 90, sku: "WS-CRD-050", isAvailable: true },
        { id: "v_crd_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 340, originalPrice: 410, stockQuantity: 75, sku: "WS-CRD-100", isAvailable: true },
        { id: "v_crd_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 820, originalPrice: 980, stockQuantity: 40, sku: "WS-CRD-250", isAvailable: true },
        { id: "v_crd_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 1580, originalPrice: 1890, stockQuantity: 20, sku: "WS-CRD-500", isAvailable: true }
      ]
    },
    {
      id: "p_garam_masala",
      name: "Royal Shahi Garam Masala",
      brand: "Naturale Heritage",
      categoryId: "cat_blended_spices",
      categoryName: "Blended Spices",
      subcategoryId: "Garam Masala",
      subcategoryName: "Garam Masala",
      shortDescription: "Handcrafted blend of 16 roasted whole spices & stone-ground herbs.",
      description: "Time-honored royal recipe combining roasted cardamom, cloves, cinnamon, mace, nutmeg, black cumin, and bay leaf.",
      rating: 4.9,
      reviewCount: 490,
      image: "/assets/images/prod_garammasala.jpg",
      origin: "Rajasthan, India",
      ingredients: "Coriander, Cumin, Cardamom, Cloves, Cinnamon, Star Anise",
      nutritionFacts: { "Energy": "370 kcal", "Protein": "12.0 g" },
      storageInstructions: "Airtight container away from steam.",
      specifications: { "Blend Count": "16 Pure Spices" },
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_gm_100", weightInGrams: 100, unit: "GM", title: "100 GM", price: 110, originalPrice: 140, stockQuantity: 120, sku: "BS-SGM-100", isAvailable: true },
        { id: "v_gm_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 250, originalPrice: 320, stockQuantity: 90, sku: "BS-SGM-250", isAvailable: true },
        { id: "v_gm_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 470, originalPrice: 590, stockQuantity: 50, sku: "BS-SGM-500", isAvailable: true },
        { id: "v_gm_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 890, originalPrice: 1100, stockQuantity: 25, sku: "BS-SGM-1000", isAvailable: true }
      ]
    },
    {
      id: "p_rolled_oats",
      name: "Gluten-Free Jumbo Rolled Oats",
      brand: "Naturale Grains",
      categoryId: "cat_cereals",
      categoryName: "Cereals",
      subcategoryId: "Rolled Oats",
      subcategoryName: "Rolled Oats",
      shortDescription: "100% whole grain rolled oats rich in beta-glucan heart fibers.",
      description: "Steamed and gently rolled whole oat groats. Packed with soluble beta-glucan fiber to support cardiovascular health.",
      rating: 4.8,
      reviewCount: 260,
      image: "/assets/images/prod_oats.jpg",
      origin: "Australia",
      ingredients: "100% Certified Gluten-Free Whole Grain Oats",
      nutritionFacts: { "Energy": "389 kcal", "Protein": "16.9 g" },
      storageInstructions: "Cool dry pantry.",
      specifications: { "Gluten Level": "< 5 ppm" },
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { id: "v_oat_250", weightInGrams: 250, unit: "GM", title: "250 GM", price: 90, originalPrice: 120, stockQuantity: 80, sku: "CR-OAT-250", isAvailable: true },
        { id: "v_oat_500", weightInGrams: 500, unit: "GM", title: "500 GM", price: 160, originalPrice: 210, stockQuantity: 60, sku: "CR-OAT-500", isAvailable: true },
        { id: "v_oat_1000", weightInGrams: 1000, unit: "KG", title: "1 KG", price: 290, originalPrice: 380, stockQuantity: 45, sku: "CR-OAT-1000", isAvailable: true }
      ]
    }
  ],
  orders: [
    {
      id: "ORD-849201",
      createdAt: "2026-11-05T14:30:00.000Z",
      status: "Delivered",
      customer: {
        name: "Aarav Sharma",
        phone: "+91 98765 43210",
        email: "aarav.sharma@example.com",
        address: { label: "Home", street: "Flat 402, Lotus Residency", city: "Bengaluru", pincode: "560038" }
      },
      items: [
        { productId: "p_almonds", productName: "California Whole Almonds", variantTitle: "500 GM", price: 540, quantity: 2 },
        { productId: "p_cardamom", productName: "Idukki Green Cardamom", variantTitle: "100 GM", price: 340, quantity: 1 }
      ],
      subtotal: 1420,
      discount: 200,
      deliveryFee: 0,
      totalAmount: 1220,
      paymentMethod: "UPI",
      paymentStatus: "Paid"
    },
    {
      id: "ORD-930412",
      createdAt: "2026-11-06T08:15:00.000Z",
      status: "Processing",
      customer: {
        name: "Priya Nair",
        phone: "+91 98112 34567",
        email: "priya.nair@example.com",
        address: { label: "Office", street: "Tower B, Cyber Gateway", city: "Hyderabad", pincode: "500081" }
      },
      items: [
        { productId: "p_cashews", productName: "Royal Mangalore Cashews", variantTitle: "250 GM", price: 320, quantity: 1 },
        { productId: "p_rolled_oats", productName: "Gluten-Free Jumbo Rolled Oats", variantTitle: "500 GM", price: 160, quantity: 2 }
      ],
      subtotal: 640,
      discount: 0,
      deliveryFee: 40,
      totalAmount: 680,
      paymentMethod: "Credit/Debit Card",
      paymentStatus: "Paid"
    }
  ],
  customers: [
    { id: "cust_1", name: "Aarav Sharma", email: "aarav.sharma@example.com", mobile: "+91 98765 43210", registeredDate: "2026-08-14", totalOrders: 8, totalSpent: 9480, city: "Bengaluru" },
    { id: "cust_2", name: "Priya Nair", email: "priya.nair@example.com", mobile: "+91 98112 34567", registeredDate: "2026-09-02", totalOrders: 3, totalSpent: 2840, city: "Hyderabad" },
    { id: "cust_3", name: "Rohan Mehra", email: "rohan.mehra@example.com", mobile: "+91 97654 32109", registeredDate: "2026-10-10", totalOrders: 5, totalSpent: 6120, city: "Mumbai" }
  ],
  coupons: [
    { id: "cpn_1", code: "WELCOME20", description: "20% off on your first order above ₹500", discountType: "percentage", discountValue: 20, minOrderValue: 500, maxDiscount: 300, expiryDate: "2026-12-31", isActive: true },
    { id: "cpn_2", code: "NATURALE100", description: "Flat ₹100 instant discount on orders above ₹800", discountType: "fixed", discountValue: 100, minOrderValue: 800, maxDiscount: 100, expiryDate: "2026-12-31", isActive: true }
  ],
  banners: [
    { id: "bnr_1", title: "20% Discount", subtitle: "Premium Dry Fruits Collection", image: "/assets/banners/banner_discount.jpg", ctaText: "Shop Collection", targetCategory: "cat_dry_fruits", isActive: true },
    { id: "bnr_2", title: "Authentic Spices", subtitle: "Discover Our Best Sellers", image: "/assets/banners/banner_collection.jpg", ctaText: "Explore Flavours", targetCategory: "cat_whole_spices", isActive: true },
    { id: "bnr_3", title: "Healthy Grains", subtitle: "Nutritious Cereals & Millets", image: "/assets/banners/banner_cereals.jpg", ctaText: "Discover Cereals", targetCategory: "cat_cereals", isActive: true }
  ],
  settings: {
    storeName: "Naturale - Premium Dry Fruits & Spices",
    contactEmail: "care@naturale.com",
    contactPhone: "+91 800-NATURALE",
    currencySymbol: "₹",
    standardDeliveryFee: 40,
    freeDeliveryThreshold: 500,
    minimumOrderValue: 150,
    lowStockThreshold: 15
  }
};

// Local storage helper
function getLocalDb() {
  const data = localStorage.getItem('naturale_admin_db');
  if (!data) {
    localStorage.setItem('naturale_admin_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DB;
  }
}

function saveLocalDb(db) {
  localStorage.setItem('naturale_admin_db', JSON.stringify(db));
}

// API methods
export const mockApi = {
  // Auth
  async login(email, password) {
    try {
      const res = await axios.post(`${API_BASE}/auth/admin-login`, { email, password }, { timeout: 1500 });
      return res.data;
    } catch {
      // Local fallback
      if (email === 'admin@naturale.com' && password === 'admin123') {
        return {
          token: 'demo_token_admin_2026',
          user: { name: 'Store Manager', email: 'admin@naturale.com', role: 'SUPER_ADMIN' }
        };
      }
      throw new Error('Invalid credentials. Use admin@naturale.com / admin123');
    }
  },

  // Products
  async getProducts() {
    try {
      const res = await axios.get(`${API_BASE}/products`, { timeout: 1500 });
      return res.data;
    } catch {
      const db = getLocalDb();
      return db.products;
    }
  },

  async createProduct(productData) {
    try {
      const res = await axios.post(`${API_BASE}/products`, productData, { timeout: 3000 });
      const db = getLocalDb();
      db.products.push(res.data);
      saveLocalDb(db);
      return res.data;
    } catch (err) {
      console.warn('Backend offline, saving product to local state:', err.message);
      const db = getLocalDb();
      const newProduct = {
        id: `p_${Date.now()}`,
        rating: 4.8,
        reviewCount: 1,
        variants: productData.variants || [
          { id: `v_${Date.now()}_100`, weightInGrams: 100, unit: "GM", title: "100 GM", price: 100, originalPrice: 120, stockQuantity: 20, sku: "NEW-100", isAvailable: true }
        ],
        ...productData
      };
      db.products.push(newProduct);
      saveLocalDb(db);
      return newProduct;
    }
  },

  async updateProduct(id, productData) {
    try {
      const res = await axios.put(`${API_BASE}/products/${id}`, productData, { timeout: 3000 });
      const db = getLocalDb();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        db.products[idx] = { ...db.products[idx], ...res.data };
        saveLocalDb(db);
      }
      return res.data;
    } catch (err) {
      const db = getLocalDb();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        db.products[idx] = { ...db.products[idx], ...productData };
        saveLocalDb(db);
        return db.products[idx];
      }
      throw new Error('Product not found');
    }
  },

  async deleteProduct(id) {
    try {
      await axios.delete(`${API_BASE}/products/${id}`, { timeout: 3000 });
    } catch (err) {
      console.warn('Backend delete note:', err.message);
    }
    const db = getLocalDb();
    db.products = db.products.filter(p => p.id !== id);
    saveLocalDb(db);
    return true;
  },

  // Weight Variants
  async updateVariant(productId, variantId, variantData) {
    const db = getLocalDb();
    const prod = db.products.find(p => p.id === productId);
    if (prod) {
      const vIdx = prod.variants.findIndex(v => v.id === variantId);
      if (vIdx !== -1) {
        prod.variants[vIdx] = { ...prod.variants[vIdx], ...variantData };
        saveLocalDb(db);
        return prod.variants[vIdx];
      }
    }
    throw new Error('Variant not found');
  },

  async addVariant(productId, variantData) {
    const db = getLocalDb();
    const prod = db.products.find(p => p.id === productId);
    if (prod) {
      const newV = {
        id: `v_${Date.now()}`,
        isAvailable: true,
        ...variantData
      };
      prod.variants.push(newV);
      saveLocalDb(db);
      return newV;
    }
    throw new Error('Product not found');
  },

  async deleteVariant(productId, variantId) {
    const db = getLocalDb();
    const prod = db.products.find(p => p.id === productId);
    if (prod) {
      prod.variants = prod.variants.filter(v => v.id !== variantId);
      saveLocalDb(db);
      return true;
    }
    throw new Error('Product not found');
  },

  // Categories
  async getCategories() {
    try {
      const res = await axios.get(`${API_BASE}/categories`, { timeout: 2500 });
      return res.data;
    } catch {
      const db = getLocalDb();
      return db.categories;
    }
  },

  async createCategory(catData) {
    try {
      const res = await axios.post(`${API_BASE}/categories`, catData, { timeout: 3000 });
      // Keep local store in sync
      const db = getLocalDb();
      db.categories.push(res.data);
      saveLocalDb(db);
      return res.data;
    } catch (err) {
      console.warn('Backend offline, saving category to local state:', err.message);
      const db = getLocalDb();
      const newCat = {
        id: `cat_${Date.now()}`,
        isActive: true,
        subcategories: [],
        ...catData
      };
      db.categories.push(newCat);
      saveLocalDb(db);
      return newCat;
    }
  },

  async updateCategory(id, catData) {
    try {
      const res = await axios.put(`${API_BASE}/categories/${id}`, catData, { timeout: 3000 });
      const db = getLocalDb();
      const idx = db.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        db.categories[idx] = { ...db.categories[idx], ...res.data };
        saveLocalDb(db);
      }
      return res.data;
    } catch (err) {
      const db = getLocalDb();
      const idx = db.categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        db.categories[idx] = { ...db.categories[idx], ...catData };
        saveLocalDb(db);
        return db.categories[idx];
      }
      throw new Error('Category not found');
    }
  },

  async deleteCategory(id) {
    try {
      await axios.delete(`${API_BASE}/categories/${id}`, { timeout: 3000 });
    } catch (err) {
      console.warn('Backend delete note:', err.message);
    }
    const db = getLocalDb();
    db.categories = db.categories.filter(c => c.id !== id);
    saveLocalDb(db);
    return true;
  },

  // Orders
  async getOrders() {
    try {
      const res = await axios.get(`${API_BASE}/orders`, { timeout: 1500 });
      return res.data;
    } catch {
      const db = getLocalDb();
      return db.orders;
    }
  },

  async updateOrderStatus(id, status) {
    const db = getLocalDb();
    const order = db.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      saveLocalDb(db);
      return order;
    }
    throw new Error('Order not found');
  },

  // Customers
  async getCustomers() {
    try {
      const res = await axios.get(`${API_BASE}/customers`, { timeout: 1500 });
      return res.data;
    } catch {
      const db = getLocalDb();
      return db.customers;
    }
  },

  // Coupons
  async getCoupons() {
    const db = getLocalDb();
    return db.coupons;
  },

  async createCoupon(data) {
    const db = getLocalDb();
    const newC = { id: `cpn_${Date.now()}`, isActive: true, ...data };
    db.coupons.push(newC);
    saveLocalDb(db);
    return newC;
  },

  async deleteCoupon(id) {
    const db = getLocalDb();
    db.coupons = db.coupons.filter(c => c.id !== id);
    saveLocalDb(db);
    return true;
  },

  // Banners
  async getBanners() {
    const db = getLocalDb();
    return db.banners;
  },

  async createBanner(data) {
    const db = getLocalDb();
    const newB = { id: `bnr_${Date.now()}`, isActive: true, ...data };
    db.banners.push(newB);
    saveLocalDb(db);
    return newB;
  },

  async deleteBanner(id) {
    const db = getLocalDb();
    db.banners = db.banners.filter(b => b.id !== id);
    saveLocalDb(db);
    return true;
  },

  // Settings
  async getSettings() {
    const db = getLocalDb();
    return db.settings;
  },

  async updateSettings(data) {
    const db = getLocalDb();
    db.settings = { ...db.settings, ...data };
    saveLocalDb(db);
    return db.settings;
  },

  // Dashboard Aggregates
  async getDashboardMetrics() {
    const db = getLocalDb();
    const orders = db.orders || [];
    const products = db.products || [];
    const customers = db.customers || [];

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    
    // Calculate low stock variants count
    let lowStockCount = 0;
    products.forEach(p => {
      (p.variants || []).forEach(v => {
        if (v.stockQuantity <= (db.settings.lowStockThreshold || 15)) {
          lowStockCount++;
        }
      });
    });

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      pendingOrders,
      lowStockCount,
      recentOrders: orders.slice(0, 5),
      salesData: [
        { month: 'Jun', sales: 45000, orders: 48 },
        { month: 'Jul', sales: 58000, orders: 62 },
        { month: 'Aug', sales: 74000, orders: 85 },
        { month: 'Sep', sales: 89000, orders: 98 },
        { month: 'Oct', sales: 112000, orders: 124 },
        { month: 'Nov', sales: 135000, orders: 148 }
      ],
      categorySales: [
        { name: 'Dry Fruits', value: 45, color: '#FF812E' },
        { name: 'Whole Spices', value: 25, color: '#FFA45B' },
        { name: 'Blended Spices', value: 18, color: '#27865F' },
        { name: 'Cereals', value: 12, color: '#898078' }
      ]
    };
  }
};

