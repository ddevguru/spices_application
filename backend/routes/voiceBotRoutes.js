const express = require('express');
const router = express.Router();
const voiceBotService = require('../services/voiceBotService');
const db = require('../config/db');

// Helper to get current product list for variety price-matching
async function getAllProducts() {
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
        variants: r.variants,
      }));
    } catch (_) {}
  }
  const fb = db.getFallbackDb();
  return fb.products || [];
}

// 1. Parse Voice / Call Transcript & Auto-Match Variety By Price
router.post('/parse-order', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    const products = await getAllProducts();
    const parsed = voiceBotService.parseVoiceOrderText(transcript, products);

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    console.error('Error parsing voice order:', err);
    return res.status(500).json({ error: 'Failed to parse voice order', details: err.message });
  }
});

// 2. Get list of recent incoming bot calls
router.get('/recent-calls', (req, res) => {
  res.json({
    success: true,
    calls: voiceBotService.recentCalls,
  });
});

// 3. Webhook for incoming call notifications from phone / free SIP / free call bridge
router.post('/incoming-call', async (req, res) => {
  try {
    const { caller, text, transcript, audioUrl } = req.body;
    const callText = transcript || text || 'Incoming customer inquiry';
    const products = await getAllProducts();
    const parsed = voiceBotService.parseVoiceOrderText(callText, products);

    const newCall = {
      id: `call_${Date.now()}`,
      callerPhone: caller || parsed.customer.phone || '9820012345',
      callerName: parsed.customer.name,
      businessName: parsed.customer.businessName,
      city: parsed.customer.city,
      address: parsed.customer.street,
      pincode: parsed.customer.pincode,
      gstNumber: parsed.customer.gstNumber,
      categoryName: parsed.selection.categoryName,
      subcategoryId: parsed.selection.subcategoryId,
      targetPrice: parsed.selection.targetPrice,
      matchedProductName: parsed.selection.productName,
      matchedProductId: parsed.selection.productId,
      matchedVariantTitle: parsed.selection.variantTitle,
      weightInGrams: parsed.selection.weightInGrams,
      quantity: parsed.selection.quantity,
      transcript: callText,
      audioUrl: audioUrl || null,
      timestamp: new Date().toISOString(),
      status: 'Ready to Feed',
    };

    voiceBotService.recentCalls.unshift(newCall);
    // Keep last 15 calls in memory
    if (voiceBotService.recentCalls.length > 15) {
      voiceBotService.recentCalls.pop();
    }

    return res.json({
      success: true,
      message: 'Call received and parsed successfully',
      call: newCall,
    });
  } catch (err) {
    console.error('Error processing incoming call webhook:', err);
    return res.status(500).json({ error: 'Failed to process incoming call', details: err.message });
  }
});

// 4. Trigger Instant Call Simulation (Test button for admin)
router.post('/simulate-call', async (req, res) => {
  try {
    const sampleTranscripts = [
      'Namaste, main Ramesh Bhai Sharma bol raha hoon Sharma Kirana & Dry Fruits Mart se, Navi Mumbai APMC market. Mera phone 9820012345 hai. Mujhe 280 rupaye wala Mamra badam chahiye, 250 gram ke 2 packet bhejna hai.',
      'Hello bhai, Suresh Patel bol raha hoon Patel Supermarket Pune se. Phone number 9819123456. California badam 120-130 ke rate wala 100g ke 5 packet bhej do.',
      'Gupta Kirana Store Thane se Rajesh Gupta baat kar raha hoon, mobile 9833445566, Thane West station road. Elaichi chahiye green cardamom 250 rupaye rate wali 250 gram ki 3 packets.',
      'Shree Ganesh Traders Kolhapur se Anil Patil. Kaju chahiye sabse badiya quality wala 350 ke aas paas rate ka 500 gram ke 4 packets.'
    ];

    const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
    const products = await getAllProducts();
    const parsed = voiceBotService.parseVoiceOrderText(randomTranscript, products);

    const callRecord = {
      id: `call_${Date.now()}`,
      callerPhone: parsed.customer.phone,
      callerName: parsed.customer.name,
      businessName: parsed.customer.businessName,
      city: parsed.customer.city,
      address: parsed.customer.street,
      pincode: parsed.customer.pincode,
      gstNumber: parsed.customer.gstNumber,
      categoryName: parsed.selection.categoryName,
      subcategoryId: parsed.selection.subcategoryId,
      targetPrice: parsed.selection.targetPrice,
      matchedProductName: parsed.selection.productName,
      matchedProductId: parsed.selection.productId,
      matchedVariantTitle: parsed.selection.variantTitle,
      weightInGrams: parsed.selection.weightInGrams,
      quantity: parsed.selection.quantity,
      transcript: randomTranscript,
      timestamp: new Date().toISOString(),
      status: 'Ready to Feed',
    };

    voiceBotService.recentCalls.unshift(callRecord);
    if (voiceBotService.recentCalls.length > 15) {
      voiceBotService.recentCalls.pop();
    }

    return res.json({
      success: true,
      message: 'Simulated customer call generated successfully',
      call: callRecord,
      parsed,
    });
  } catch (err) {
    console.error('Error simulating call:', err);
    return res.status(500).json({ error: 'Failed to simulate call' });
  }
});

module.exports = router;
