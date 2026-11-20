const http = require('http');
const app = require('../server');

let server;
const PORT = 5099;
const API_BASE = `http://localhost:${PORT}/api/voice-orders`;
const HEADERS = {
  'Content-Type': 'application/json',
  'x-voice-api-key': 'naturale_voice_internal_secret_2026'
};

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const req = http.request(url, {
      method,
      headers: HEADERS
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Phase 2 Voice Order API Integration Tests...');

  server = app.listen(PORT);
  // Wait a moment for server to bind
  await new Promise(r => setTimeout(r, 800));

  try {
    // 1. Categories
    console.log('1. Testing GET /catalogue/categories...');
    const catRes = await makeRequest('GET', '/api/voice-orders/catalogue/categories');
    console.log(`   Status: ${catRes.status}, Categories found: ${catRes.data?.data?.length}`);
    if (!catRes.data?.success || !catRes.data?.data?.length) throw new Error('Failed to fetch categories');

    // 2. Subcategories
    console.log('2. Testing GET /catalogue/subcategories?category=Dry Fruits...');
    const subRes = await makeRequest('GET', '/api/voice-orders/catalogue/subcategories?category=Dry Fruits');
    console.log(`   Status: ${subRes.status}, Subcategories:`, subRes.data?.subcategories?.slice(0, 4));
    if (!subRes.data?.success || !subRes.data?.subcategories?.length) throw new Error('Failed to fetch subcategories');

    // 3. Products
    console.log('3. Testing GET /catalogue/products?subcategoryId=Almonds...');
    const prodRes = await makeRequest('GET', '/api/voice-orders/catalogue/products?subcategoryId=Almonds');
    console.log(`   Status: ${prodRes.status}, Products count: ${prodRes.data?.count}`);
    if (!prodRes.data?.success || !prodRes.data?.data?.length) throw new Error('Failed to fetch products');
    const firstProduct = prodRes.data.data[0];
    console.log(`   Sample product: "${firstProduct.name}" (ID: ${firstProduct.id})`);

    // 4. Variants
    console.log(`4. Testing GET /catalogue/variants?productId=${firstProduct.id}...`);
    const varRes = await makeRequest('GET', `/api/voice-orders/catalogue/variants?productId=${firstProduct.id}`);
    console.log(`   Status: ${varRes.status}, Variants count: ${varRes.data?.variants?.length}`);
    if (!varRes.data?.success || !varRes.data?.variants?.length) throw new Error('Failed to fetch variants');
    const firstVariant = varRes.data.variants[0];
    console.log(`   Sample variant: "${firstVariant.title}" (Price: ₹${firstVariant.price}, Stock: ${firstVariant.stockQuantity})`);

    // 5. Stock availability
    console.log(`5. Testing GET /catalogue/check-availability?variantId=${firstVariant.id}&quantity=2...`);
    const availRes = await makeRequest('GET', `/api/voice-orders/catalogue/check-availability?variantId=${firstVariant.id}&quantity=2`);
    console.log(`   Status: ${availRes.status}, Available: ${availRes.data?.isAvailable}, Total: ₹${availRes.data?.totalPrice}`);
    if (!availRes.data?.success) throw new Error('Failed to check availability');

    // 6. Customer lookup
    console.log('6. Testing GET /customer/lookup?phone=9820012345...');
    const custRes = await makeRequest('GET', '/api/voice-orders/customer/lookup?phone=9820012345');
    console.log(`   Status: ${custRes.status}, Registered: ${custRes.data?.isRegistered}`);

    // 7. Start call session
    const testCallId = `call_test_${Date.now()}`;
    console.log(`7. Testing POST /calls/start (ID: ${testCallId})...`);
    const callStartRes = await makeRequest('POST', '/api/voice-orders/calls/start', {
      call_id: testCallId,
      caller_phone: '9820012345',
      customer_name: 'Ramesh Bhai Sharma',
      business_name: 'Sharma Dry Fruits Mart'
    });
    console.log(`   Status: ${callStartRes.status}, Call Status: ${callStartRes.data?.status}`);
    if (!callStartRes.data?.success) throw new Error('Failed to start call session');

    // 8. Create Draft Order (Server-side price calculation & validation)
    console.log('8. Testing POST /drafts (AI-Generated Draft Order)...');
    const draftPayload = {
      source: 'ai_voice',
      call_id: testCallId,
      customer: {
        name: 'Ramesh Bhai Sharma',
        phone: '9820012345',
        business_name: 'Sharma Dry Fruits Mart',
        gst_number: '27AAACS1234A1Z5'
      },
      delivery: {
        address: 'Shop No. 12, APMC Grain Market, Sector 19',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '400705'
      },
      items: [
        {
          product_id: firstProduct.id,
          variant_id: firstVariant.id,
          quantity: 3
        }
      ],
      delivery_instructions: 'Deliver before 5 PM at APMC shop'
    };
    const draftRes = await makeRequest('POST', '/api/voice-orders/drafts', draftPayload);
    console.log(`   Status: ${draftRes.status}, Draft ID: ${draftRes.data?.draft?.id}`);
    console.log(`   Server Calculated: Subtotal: ₹${draftRes.data?.draft?.subtotal}, Total: ₹${draftRes.data?.draft?.total_amount}`);
    if (!draftRes.data?.success || !draftRes.data?.draft?.id) throw new Error('Failed to create draft order');

    // 9. Idempotency test (Retry same draft call)
    console.log('9. Testing Idempotency (resending same call_id)...');
    const retryRes = await makeRequest('POST', '/api/voice-orders/drafts', draftPayload);
    console.log(`   Status: ${retryRes.status}, Is Existing: ${retryRes.data?.isExisting}, Matches ID: ${retryRes.data?.draft?.id === draftRes.data.draft.id}`);
    if (!retryRes.data?.isExisting) throw new Error('Idempotency check failed!');

    // 10. End Call Session
    console.log('10. Testing POST /calls/end...');
    const callEndRes = await makeRequest('POST', '/api/voice-orders/calls/end', {
      call_id: testCallId,
      duration_seconds: 48,
      status: 'completed',
      transcript: 'Customer ordered 3 packets of California Almonds for Sharma Dry Fruits Mart.',
      draft_order_id: draftRes.data.draft.id,
      requires_human_intervention: false
    });
    console.log(`   Status: ${callEndRes.status}, End Call Status: ${callEndRes.data?.status}`);

    // 11. Dashboard Metrics
    console.log('11. Testing GET /metrics...');
    const metricsRes = await makeRequest('GET', '/api/voice-orders/metrics');
    console.log(`   Status: ${metricsRes.status}, Metrics:`, metricsRes.data?.metrics);
    if (!metricsRes.data?.success) throw new Error('Failed to fetch metrics');

    console.log('\n✅ ALL 11 PHASE 2 BACKEND API TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();

