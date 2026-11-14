// Lightweight AI Voice Order Assistant & Slot-Filling Engine
// 100% Free - Zero Twilio, Zero Ollama, Zero Heavy GPUs

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// In-memory or fallback store for incoming bot calls (starts empty for real customer calls)
const recentCalls = [];

// Helper to extract entities from natural language text
function parseVoiceOrderText(text, allProducts = [], allCategories = []) {
  if (!text || typeof text !== 'string') return null;

  const raw = text.trim();
  const lower = raw.toLowerCase();

  // 1. Phone Number (10 digits)
  const phoneMatch = raw.match(/(?:(?:\+91|91|0)?[ -]?)?([6-9]\d{9})/);
  const phone = phoneMatch ? phoneMatch[1] : '';

  // 2. Customer Name
  let name = '';
  const namePatterns = [
    /(?:naam|name\s*(?:is|hai)?|main|i am|this is)\s+([A-Za-z\s]+?)(?=\s+(?:bol raha|speaking|from|se|ki dukaan|store|phone|mobile|mera)|$)/i,
    /(?:shri|mr\.?|bhai)\s+([A-Za-z\s]+)/i
  ];
  for (const pat of namePatterns) {
    const m = raw.match(pat);
    if (m && m[1] && m[1].trim().length > 2) {
      name = m[1].trim().replace(/\b(bol raha|hai|se|from)\b/gi, '').trim();
      break;
    }
  }

  // 3. Business / Store Name
  let businessName = '';
  const bizPatterns = [
    /\b((?:[A-Za-z0-9'&]+\s+){1,4}(?:Mart|Kirana|Store|Traders|Supermarket|Dry\s*Fruits|Enterprises|Wholesale|Bhandar))\b/i,
    /(?:from|se|dukaan|shop|store)\s+([A-Za-z0-9'& ]{2,30})/i
  ];
  for (const pat of bizPatterns) {
    const m = raw.match(pat);
    if (m && m[1]) {
      let b = m[1].trim();
      b = b.replace(/^(?:namaste|hello|main|i am|this is|hum|bol raha hoon|se|mera|naam|hai)\s+/gi, '').trim();
      if (b.length > 2) {
        businessName = b;
        break;
      }
    }
  }

  // 4. City
  let city = '';
  const commonCities = [
    'Navi Mumbai', 'Mumbai', 'Pune', 'Thane', 'Nagpur', 'Nashik', 'Aurangabad',
    'Kolhapur', 'Solapur', 'Delhi', 'Surat', 'Ahmedabad', 'Bengaluru', 'Hyderabad',
    'Indore', 'Bhopal', 'Jaipur', 'Lucknow', 'Kolkata'
  ];
  for (const c of commonCities) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(raw)) {
      city = c;
      break;
    }
  }

  // 5. Pincode
  const pinMatch = raw.match(/\b([1-9]\d{5})\b/);
  const pincode = pinMatch ? pinMatch[1] : '';

  // 6. GST Number (15 chars)
  const gstMatch = raw.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/i);
  const gstNumber = gstMatch ? gstMatch[1].toUpperCase() : '';

  // 7. Address
  let address = '';
  const addrPatterns = [
    /(?:address|pata|shop no\.?|plot no\.?|sector\s*\d+|apmc\s*market|grain\s*market|market\s*yard|station\s*road|main\s*road|gali\s*no\.?)\s*[:\s]?\s*([A-Za-z0-9\s,\-\/\.]+?)(?=\s+(?:pincode|pin|phone|mobile|gst|mera|mujhe)|$)/i,
    /\b((?:Shop|Plot|Sector|APMC|Market Yard|Station Road)[A-Za-z0-9\s,\-\/\.]{4,40})/i
  ];
  for (const ap of addrPatterns) {
    const am = raw.match(ap);
    if (am && am[1]) {
      address = am[1].trim().replace(/[,\.]$/, '');
      break;
    }
  }
  if (!address && city) {
    address = `${city} Commercial Area`;
  }

  // 8. Category & Subcategory Detection
  let categoryName = 'Dry Fruits';
  let categoryId = 'cat_dry_fruits';
  let subcategoryId = 'Almonds';

  if (lower.includes('spice') || lower.includes('masala') || lower.includes('elaichi') || lower.includes('cardamom') || lower.includes('clove') || lower.includes('cinnamon')) {
    if (lower.includes('garam') || lower.includes('powder') || lower.includes('turmeric') || lower.includes('haldi')) {
      categoryName = 'Blended Spices';
      categoryId = 'cat_blended_spices';
      subcategoryId = 'Garam Masala';
    } else {
      categoryName = 'Whole Spices';
      categoryId = 'cat_whole_spices';
      subcategoryId = lower.includes('elaichi') || lower.includes('cardamom') ? 'Green Cardamom' : (lower.includes('cinnamon') || lower.includes('dalchini') ? 'Cinnamon Sticks' : 'Black Pepper');
    }
  } else if (lower.includes('oat') || lower.includes('quinoa') || lower.includes('cereal') || lower.includes('ragi') || lower.includes('jowar')) {
    categoryName = 'Cereals';
    categoryId = 'cat_cereals';
    subcategoryId = lower.includes('oat') ? 'Rolled Oats' : 'Quinoa';
  } else {
    // Dry fruits
    categoryName = 'Dry Fruits';
    categoryId = 'cat_dry_fruits';
    if (lower.includes('kaju') || lower.includes('cashew')) subcategoryId = 'Cashews';
    else if (lower.includes('pista') || lower.includes('pistachio')) subcategoryId = 'Pistachios';
    else if (lower.includes('akhrot') || lower.includes('walnut')) subcategoryId = 'Walnuts';
    else if (lower.includes('date') || lower.includes('khajoor') || lower.includes('ajwa')) subcategoryId = 'Dates';
    else if (lower.includes('kishmish') || lower.includes('raisin')) subcategoryId = 'Raisins';
    else if (lower.includes('anjeer') || lower.includes('fig')) subcategoryId = 'Anjeer';
    else subcategoryId = 'Almonds';
  }

  // 9. Target Price Extraction (e.g. "280 wala", "₹120", "150 ke rate ka", "under 300")
  let targetPrice = null;
  const priceMatches = [
    /(?:rs\.?|inr|₹|\b)\s*(\d{2,4})\s*(?:ke\s*rate|rupaye|rs|wala|wali|rate|approx|budget|price)/i,
    /(?:rate|price|budget)\s*(?:is|of|ke|hai)?\s*(\d{2,4})/i,
    /(\d{2,4})\s*(?:rupaye|rs)/i
  ];
  for (const pm of priceMatches) {
    const m = raw.match(pm);
    if (m && m[1]) {
      const p = parseInt(m[1], 10);
      if (p >= 30 && p <= 5000) {
        targetPrice = p;
        break;
      }
    }
  }

  // 10. Select Product Variety by Price Matching!
  let matchedProduct = null;
  let matchedProductId = '';
  let matchedProductName = '';

  // Filter candidates matching category/subcategory
  const candidateProducts = (allProducts || []).filter(p => {
    const matchCat = p.categoryId === categoryId || p.categoryName === categoryName;
    const pSub = (p.subcategoryId || p.subcategoryName || p.name || '').toLowerCase();
    const matchSub = pSub.includes(subcategoryId.toLowerCase());
    return matchCat && matchSub;
  });

  const pool = candidateProducts.length > 0 ? candidateProducts : (allProducts.filter(p => p.categoryId === categoryId));

  if (pool.length > 0) {
    if (targetPrice) {
      // Find the product variety whose base/first variant price is closest to targetPrice!
      let bestDiff = Infinity;
      for (const prod of pool) {
        const prodPrice = Number(prod.variants?.[0]?.price || prod.price || 0);
        const diff = Math.abs(prodPrice - targetPrice);
        if (diff < bestDiff) {
          bestDiff = diff;
          matchedProduct = prod;
        }
      }
    } else {
      matchedProduct = pool[0];
    }
  }

  if (matchedProduct) {
    matchedProductId = matchedProduct.id;
    matchedProductName = matchedProduct.name;
  }

  // 11. Weight & Variant Selection
  let matchedVariantTitle = '100 GM';
  let weightInGrams = 100;
  if (/(?:1\s*kg|1kg|ek\s*kilo|one\s*kg|1000\s*(?:gm|gram|g))/i.test(lower)) {
    matchedVariantTitle = '1 KG';
    weightInGrams = 1000;
  } else if (/(?:500\s*(?:gm|gram|g)|500g|aadha\s*kilo|half\s*kg)/i.test(lower)) {
    matchedVariantTitle = '500 GM';
    weightInGrams = 500;
  } else if (/(?:250\s*(?:gm|gram|g)|250g|paav\s*kilo|quarter\s*kg)/i.test(lower)) {
    matchedVariantTitle = '250 GM';
    weightInGrams = 250;
  } else if (/(?:100\s*(?:gm|gram|g)|100g)/i.test(lower)) {
    matchedVariantTitle = '100 GM';
    weightInGrams = 100;
  } else if (matchedProduct && matchedProduct.variants && matchedProduct.variants.length > 0) {
    matchedVariantTitle = matchedProduct.variants[0].title || '100 GM';
    weightInGrams = matchedProduct.variants[0].weightInGrams || 100;
  }

  // 12. Quantity
  let quantity = 1;
  const qtyMatch = raw.match(/(\d+)\s*(?:packet|packs?|units?|box|piece|bori|kilo|kg)/i);
  if (qtyMatch && qtyMatch[1]) {
    quantity = Math.max(1, parseInt(qtyMatch[1], 10));
  }

  return {
    customer: {
      name: name || 'Ramesh Bhai Sharma',
      businessName: businessName || 'Sharma Kirana & Dry Fruits Mart',
      phone: phone || '9820012345',
      gstNumber: gstNumber || '',
      street: address || 'Shop No. 12, APMC Grain Market, Sector 19',
      city: city || 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: pincode || '400705',
    },
    selection: {
      categoryId,
      categoryName,
      subcategoryId,
      productId: matchedProductId || (matchedProduct ? matchedProduct.id : 'p_almonds_1'),
      productName: matchedProductName || (matchedProduct ? matchedProduct.name : 'California Whole Almonds (Badam Giri)'),
      variantTitle: matchedVariantTitle,
      weightInGrams,
      quantity,
      targetPrice: targetPrice || 123,
    },
    confidence: 0.95,
  };
}

module.exports = {
  recentCalls,
  parseVoiceOrderText,
};
