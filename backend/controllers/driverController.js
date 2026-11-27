const db = require('../config/db');

// Helper to generate a 4-digit Delivery OTP
function generateDeliveryOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Helper to normalize driver record for API responses
function formatDriver(d) {
  return {
    id: d.id,
    name: d.name,
    phone: d.phone,
    email: d.email || '',
    vehicleType: d.vehicle_type || d.vehicleType || 'Bike',
    vehicleNumber: d.vehicle_number || d.vehicleNumber || '',
    licenseNumber: d.license_number || d.licenseNumber || '',
    isActive: d.is_active !== false,
    isOnline: Boolean(d.is_online ?? d.isOnline),
    currentLat: parseFloat(d.current_lat ?? d.currentLat ?? 19.0760),
    currentLng: parseFloat(d.current_lng ?? d.currentLng ?? 72.8777),
    heading: parseFloat(d.heading ?? 0),
    speed: parseFloat(d.speed ?? 0),
  };
}

// -----------------------------------------------------------------------------
// DRIVER AUTH & PROFILE
// -----------------------------------------------------------------------------

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone number and password are required' });
    }

    const cleanPhone = String(phone).trim().replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    if (db.isPostgresConnected()) {
      const q = `SELECT * FROM drivers WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $1 LIMIT 1`;
      const result = await db.query(q, [cleanPhone]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Driver not found with this phone number' });
      }
      const driver = result.rows[0];
      if (driver.is_active === false) {
        return res.status(403).json({ success: false, message: 'Your driver account is suspended. Please contact admin.' });
      }
      if (driver.password_hash !== password) {
        return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
      }
      return res.json({
        success: true,
        message: 'Login successful',
        driver: formatDriver(driver)
      });
    } else {
      const fb = db.getFallbackDb();
      const driver = (fb.drivers || []).find(d => String(d.phone).replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
      if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found with this phone number' });
      }
      if (driver.is_active === false) {
        return res.status(403).json({ success: false, message: 'Your driver account is suspended. Please contact admin.' });
      }
      if (driver.password_hash !== password) {
        return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
      }
      return res.json({
        success: true,
        message: 'Login successful',
        driver: formatDriver(driver)
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const driverId = req.params.id || req.query.driverId;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'driverId is required' });
    }
    if (db.isPostgresConnected()) {
      const result = await db.query('SELECT * FROM drivers WHERE id = $1', [driverId]);
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Driver not found' });
      return res.json({ success: true, driver: formatDriver(result.rows[0]) });
    } else {
      const fb = db.getFallbackDb();
      const driver = (fb.drivers || []).find(d => d.id === driverId);
      if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
      return res.json({ success: true, driver: formatDriver(driver) });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { driverId, isOnline } = req.body;
    const onlineBool = Boolean(isOnline);

    if (db.isPostgresConnected()) {
      await db.query(
        'UPDATE drivers SET is_online = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [onlineBool, driverId]
      );
      return res.json({ success: true, isOnline: onlineBool });
    } else {
      const fb = db.getFallbackDb();
      const driver = (fb.drivers || []).find(d => d.id === driverId);
      if (driver) {
        driver.is_online = onlineBool;
        db.saveFallbackDb(fb);
      }
      return res.json({ success: true, isOnline: onlineBool });
    }
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------------------------
// LIVE GPS HEARTBEAT LOCATION STREAMING
// -----------------------------------------------------------------------------

exports.updateLocation = async (req, res, next) => {
  try {
    const { driverId, lat, lng, heading, speed } = req.body;
    if (!driverId || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'driverId, lat and lng are required' });
    }

    const currentLat = parseFloat(lat);
    const currentLng = parseFloat(lng);
    const head = parseFloat(heading || 0);
    const spd = parseFloat(speed || 0);
    const now = new Date().toISOString();

    if (db.isPostgresConnected()) {
      await db.query(`
        UPDATE drivers
        SET current_lat = $1, current_lng = $2, heading = $3, speed = $4,
            last_location_update = CURRENT_TIMESTAMP, is_online = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [currentLat, currentLng, head, spd, driverId]);
    } else {
      const fb = db.getFallbackDb();
      const driver = (fb.drivers || []).find(d => d.id === driverId);
      if (driver) {
        driver.current_lat = currentLat;
        driver.current_lng = currentLng;
        driver.heading = head;
        driver.speed = spd;
        driver.is_online = true;
        driver.last_location_update = now;
        db.saveFallbackDb(fb);
      }
    }

    return res.json({
      success: true,
      timestamp: now,
      coordinates: { lat: currentLat, lng: currentLng, heading: head, speed: spd }
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------------------------
// DRIVER DELIVERIES & LIFECYCLE
// -----------------------------------------------------------------------------

exports.getAssignedDeliveries = async (req, res, next) => {
  try {
    const driverId = req.query.driverId || req.params.driverId;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'driverId query parameter required' });
    }

    if (db.isPostgresConnected()) {
      const q = `
        SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'productId', oi.product_id,
                'productName', oi.product_name,
                'variantTitle', oi.variant_title,
                'weightInGrams', oi.weight_in_grams,
                'price', oi.price::float,
                'quantity', oi.quantity,
                'image', oi.image
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.driver_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      const result = await db.query(q, [driverId]);
      const orders = result.rows.map(r => ({
        id: r.id,
        status: r.status,
        customerName: r.customer_name,
        customerPhone: r.customer_phone,
        customerEmail: r.customer_email,
        address: typeof r.shipping_address === 'string' ? JSON.parse(r.shipping_address) : r.shipping_address,
        deliveryInstructions: r.delivery_instructions,
        items: r.items,
        totalAmount: parseFloat(r.total_amount),
        paymentMethod: r.payment_method,
        paymentStatus: r.payment_status,
        deliveryOtp: r.delivery_otp,
        assignedAt: r.driver_assigned_at,
        deliveredAt: r.delivered_at,
        createdAt: r.created_at
      }));
      return res.json({ success: true, deliveries: orders });
    } else {
      const fb = db.getFallbackDb();
      const deliveries = (fb.orders || [])
        .filter(o => o.driver_id === driverId || o.driverId === driverId)
        .map(r => ({
          id: r.id,
          status: r.status || 'Out for Delivery',
          customerName: r.customerName || r.customer_name || (r.customer && r.customer.name) || 'Customer',
          customerPhone: r.customerPhone || r.customer_phone || (r.customer && r.customer.phone) || '',
          customerEmail: r.customerEmail || r.customer_email || '',
          address: typeof r.shipping_address === 'string'
            ? JSON.parse(r.shipping_address)
            : (r.address || r.shipping_address || (r.customer && r.customer.address) || {}),
          deliveryInstructions: r.deliveryInstructions || r.delivery_instructions || '',
          items: r.items || [],
          totalAmount: parseFloat(r.totalAmount ?? r.total_amount ?? 0),
          paymentMethod: r.paymentMethod || r.payment_method || 'COD',
          paymentStatus: r.paymentStatus || r.payment_status || 'Pending',
          deliveryOtp: r.deliveryOtp || r.delivery_otp || null,
          assignedAt: r.assignedAt || r.driver_assigned_at || null,
          deliveredAt: r.deliveredAt || r.delivered_at || null,
          createdAt: r.createdAt || r.created_at || new Date().toISOString()
        }));
      return res.json({ success: true, deliveries });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateDeliveryStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status, otp, driverId, cashCollected } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: 'orderId and status are required' });
    }

    // If Driver is marking as Delivered, verify 4-digit OTP
    if (status.toLowerCase() === 'delivered') {
      let expectedOtp = null;
      if (db.isPostgresConnected()) {
        const check = await db.query('SELECT delivery_otp, payment_method FROM orders WHERE id = $1', [orderId]);
        if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        expectedOtp = check.rows[0].delivery_otp;
      } else {
        const fb = db.getFallbackDb();
        const ord = (fb.orders || []).find(o => o.id === orderId);
        if (!ord) return res.status(404).json({ success: false, message: 'Order not found' });
        expectedOtp = ord.delivery_otp || ord.deliveryOtp;
      }

      // If order has an OTP, validate it
      if (expectedOtp && String(otp).trim() !== String(expectedOtp).trim()) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect Delivery OTP! Please ask customer for their 4-digit OTP displayed in their Naturale App.'
        });
      }
    }

    const now = new Date().toISOString();

    if (db.isPostgresConnected()) {
      let updateQ = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP';
      const params = [status];
      let pIdx = 2;

      if (status.toLowerCase() === 'delivered') {
        updateQ += `, delivered_at = CURRENT_TIMESTAMP, payment_status = 'Paid'`;
      }
      updateQ += ` WHERE id = $${pIdx}`;
      params.push(orderId);

      await db.query(updateQ, params);
      return res.json({ success: true, message: `Order updated to ${status}`, orderId, status });
    } else {
      const fb = db.getFallbackDb();
      const ord = (fb.orders || []).find(o => o.id === orderId);
      if (ord) {
        ord.status = status;
        if (status.toLowerCase() === 'delivered') {
          ord.delivered_at = now;
          ord.payment_status = 'Paid';
        }
        db.saveFallbackDb(fb);
      }
      return res.json({ success: true, message: `Order updated to ${status}`, orderId, status });
    }
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------------------------
// ADMIN DRIVER & FLEET MANAGEMENT
// -----------------------------------------------------------------------------

exports.getAdminDrivers = async (req, res, next) => {
  try {
    if (db.isPostgresConnected()) {
      const q = `
        SELECT d.*,
          COUNT(CASE WHEN o.status IN ('Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery') THEN 1 END) as active_deliveries
        FROM drivers d
        LEFT JOIN orders o ON d.id = o.driver_id
        GROUP BY d.id
        ORDER BY d.created_at DESC
      `;
      const result = await db.query(q);
      const drivers = result.rows.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        vehicleType: r.vehicle_type,
        vehicleNumber: r.vehicle_number,
        licenseNumber: r.license_number,
        isActive: r.is_active,
        isOnline: r.is_online,
        currentLat: parseFloat(r.current_lat || 19.0760),
        currentLng: parseFloat(r.current_lng || 72.8777),
        heading: parseFloat(r.heading || 0),
        speed: parseFloat(r.speed || 0),
        lastLocationUpdate: r.last_location_update,
        activeDeliveries: parseInt(r.active_deliveries || 0, 10),
        createdAt: r.created_at
      }));
      return res.json({ success: true, drivers });
    } else {
      const fb = db.getFallbackDb();
      const drivers = (fb.drivers || []).map(d => {
        const activeCount = (fb.orders || []).filter(o => 
          (o.driver_id === d.id || o.driverId === d.id) &&
          !['Delivered', 'Cancelled'].includes(o.status)
        ).length;
        return {
          id: d.id,
          name: d.name,
          phone: d.phone,
          email: d.email,
          vehicleType: d.vehicle_type,
          vehicleNumber: d.vehicle_number,
          licenseNumber: d.license_number,
          isActive: d.is_active !== false,
          isOnline: d.is_online === true,
          currentLat: parseFloat(d.current_lat || 19.0760),
          currentLng: parseFloat(d.current_lng || 72.8777),
          heading: parseFloat(d.heading || 0),
          speed: parseFloat(d.speed || 0),
          lastLocationUpdate: d.last_location_update,
          activeDeliveries: activeCount,
          createdAt: d.created_at
        };
      });
      return res.json({ success: true, drivers });
    }
  } catch (err) {
    next(err);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const { name, phone, email, vehicleType, vehicleNumber, licenseNumber, password } = req.body;
    if (!name || !phone || !vehicleNumber) {
      return res.status(400).json({ success: false, message: 'Name, Phone and Vehicle Number are required' });
    }

    const cleanPhone = String(phone).trim().replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }
    const driverId = `DRV-${Date.now().toString().slice(-4)}`;
    const pass = password || 'driver123';
    const vType = vehicleType || 'Bike';

    if (db.isPostgresConnected()) {
      const existing = await db.query(
        `SELECT id FROM drivers WHERE RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $1 LIMIT 1`,
        [cleanPhone]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'A driver with this phone number already exists' });
      }
      await db.query(`
        INSERT INTO drivers (id, name, phone, email, password_hash, vehicle_type, vehicle_number, license_number, is_active, is_online, current_lat, current_lng)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, FALSE, 19.0760, 72.8777)
      `, [driverId, name, cleanPhone, email || '', pass, vType, vehicleNumber, licenseNumber || '']);
    } else {
      const fb = db.getFallbackDb();
      if (!fb.drivers) fb.drivers = [];
      if (fb.drivers.some(d => String(d.phone).replace(/[^0-9]/g, '').slice(-10) === cleanPhone)) {
        return res.status(409).json({ success: false, message: 'A driver with this phone number already exists' });
      }
      fb.drivers.push({
        id: driverId,
        name,
        phone: cleanPhone,
        email: email || '',
        password_hash: pass,
        vehicle_type: vType,
        vehicle_number: vehicleNumber,
        license_number: licenseNumber || '',
        is_active: true,
        is_online: false,
        current_lat: 19.0760,
        current_lng: 72.8777,
        heading: 0,
        speed: 0,
        last_location_update: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
      db.saveFallbackDb(fb);
    }

    return res.status(201).json({
      success: true,
      message: 'Driver account created successfully',
      driver: { id: driverId, name, phone: cleanPhone, vehicleType: vType, vehicleNumber }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const { name, phone, email, vehicleType, vehicleNumber, licenseNumber, password, isActive, isOnline } = req.body;

    if (db.isPostgresConnected()) {
      await db.query(`
        UPDATE drivers
        SET name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            email = COALESCE($3, email),
            vehicle_type = COALESCE($4, vehicle_type),
            vehicle_number = COALESCE($5, vehicle_number),
            license_number = COALESCE($6, license_number),
            password_hash = COALESCE($7, password_hash),
            is_active = COALESCE($8, is_active),
            is_online = COALESCE($9, is_online),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
      `, [name, phone, email, vehicleType, vehicleNumber, licenseNumber, password || null, isActive, isOnline, driverId]);
    } else {
      const fb = db.getFallbackDb();
      const d = (fb.drivers || []).find(drv => drv.id === driverId);
      if (d) {
        if (name !== undefined) d.name = name;
        if (phone !== undefined) d.phone = phone;
        if (email !== undefined) d.email = email;
        if (vehicleType !== undefined) d.vehicle_type = vehicleType;
        if (vehicleNumber !== undefined) d.vehicle_number = vehicleNumber;
        if (licenseNumber !== undefined) d.license_number = licenseNumber;
        if (password) d.password_hash = password;
        if (isActive !== undefined) d.is_active = isActive;
        if (isOnline !== undefined) d.is_online = isOnline;
        db.saveFallbackDb(fb);
      }
    }

    return res.json({ success: true, message: 'Driver updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    const driverId = req.params.id;
    if (db.isPostgresConnected()) {
      // Unlink driver from existing orders to prevent foreign key errors
      await db.query('UPDATE orders SET driver_id = NULL WHERE driver_id = $1', [driverId]);
      await db.query('DELETE FROM drivers WHERE id = $1', [driverId]);
    } else {
      const fb = db.getFallbackDb();
      fb.drivers = (fb.drivers || []).filter(d => d.id !== driverId);
      (fb.orders || []).forEach(o => {
        if (o.driver_id === driverId || o.driverId === driverId) {
          o.driver_id = null;
          o.driverId = null;
        }
      });
      db.saveFallbackDb(fb);
    }
    return res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Admin assigns delivery driver to an order
exports.assignOrderToDriver = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { driverId } = req.body;

    if (!orderId || !driverId) {
      return res.status(400).json({ success: false, message: 'orderId and driverId are required' });
    }

    const otp = generateDeliveryOtp();
    const now = new Date().toISOString();

    if (db.isPostgresConnected()) {
      await db.query(`
        UPDATE orders
        SET driver_id = $1, driver_assigned_at = CURRENT_TIMESTAMP, delivery_otp = $2, status = 'Out for Delivery', updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [driverId, otp, orderId]);

      const driverRes = await db.query('SELECT name, phone, vehicle_type, vehicle_number FROM drivers WHERE id = $1', [driverId]);
      const driver = driverRes.rows[0] || {};

      return res.json({
        success: true,
        message: 'Order assigned to driver successfully',
        orderId,
        driverId,
        driverName: driver.name,
        driverPhone: driver.phone,
        vehicleNumber: driver.vehicle_number,
        deliveryOtp: otp,
        status: 'Out for Delivery'
      });
    } else {
      const fb = db.getFallbackDb();
      if (!fb.orders) fb.orders = [];
      let ord = fb.orders.find(o => o.id === orderId);
      const drv = (fb.drivers || []).find(d => d.id === driverId);

      if (!ord) {
        ord = {
          id: orderId,
          customer_name: 'Deepak Mishra',
          customer_phone: '9820012345',
          shipping_address: { street: 'Shop No. 12, APMC Market', city: 'Navi Mumbai', pincode: '400705' },
          total_amount: 1195,
          status: 'Confirmed'
        };
        fb.orders.push(ord);
      }

      ord.driver_id = driverId;
      ord.driverId = driverId;
      ord.driver_assigned_at = now;
      ord.delivery_otp = otp;
      ord.deliveryOtp = otp;
      ord.status = 'Out for Delivery';
      db.saveFallbackDb(fb);

      return res.json({
        success: true,
        message: 'Order assigned to driver successfully',
        orderId,
        driverId,
        driverName: drv ? drv.name : 'Delivery Partner',
        driverPhone: drv ? drv.phone : '',
        vehicleNumber: drv ? drv.vehicle_number : '',
        deliveryOtp: otp,
        status: 'Out for Delivery'
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.unassignOrderFromDriver = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (db.isPostgresConnected()) {
      await db.query(`
        UPDATE orders
        SET driver_id = NULL, delivery_otp = NULL, status = 'Confirmed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [orderId]);
    } else {
      const fb = db.getFallbackDb();
      if (!fb.orders) fb.orders = [];
      const ord = fb.orders.find(o => o.id === orderId);
      if (ord) {
        ord.driver_id = null;
        ord.driverId = null;
        ord.driver_name = null;
        ord.driverName = null;
        ord.delivery_otp = null;
        ord.deliveryOtp = null;
        ord.status = 'Confirmed';
        db.saveFallbackDb(fb);
      }
    }
    return res.json({ success: true, message: 'Order unassigned successfully', orderId });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------------------------
// CUSTOMER & ADMIN LIVE TRACKING
// -----------------------------------------------------------------------------

exports.getOrderTracking = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    let order = null;
    let driver = null;

    if (db.isPostgresConnected()) {
      const ordRes = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      if (ordRes.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      order = ordRes.rows[0];

      if (order.driver_id) {
        const drvRes = await db.query('SELECT * FROM drivers WHERE id = $1', [order.driver_id]);
        if (drvRes.rows.length > 0) {
          driver = drvRes.rows[0];
        }
      }
    } else {
      const fb = db.getFallbackDb();
      order = (fb.orders || []).find(o => o.id === orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      const drvId = order.driver_id || order.driverId;
      if (drvId) {
        driver = (fb.drivers || []).find(d => d.id === drvId);
      }
    }

    const assignedDriver = driver ? {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicle_type || 'Bike',
      vehicleNumber: driver.vehicle_number || '',
      isOnline: driver.is_online,
      currentLat: parseFloat(driver.current_lat || 19.0760),
      currentLng: parseFloat(driver.current_lng || 72.8777),
      heading: parseFloat(driver.heading || 0),
      speed: parseFloat(driver.speed || 0),
      lastUpdated: driver.last_location_update
    } : null;

    return res.json({
      success: true,
      orderId: order.id,
      status: order.status,
      deliveryOtp: order.delivery_otp || order.deliveryOtp || '4821',
      assignedAt: order.driver_assigned_at,
      deliveredAt: order.delivered_at,
      assignedDriver,
      destination: {
        customerName: order.customer_name || (order.customer && order.customer.name),
        phone: order.customer_phone || (order.customer && order.customer.phone),
        address: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : (order.shipping_address || (order.customer && order.customer.address)),
        lat: 19.0330, // Navi Mumbai Hub destination default
        lng: 73.0297
      },
      estimatedArrival: '15-25 mins'
    });
  } catch (err) {
    next(err);
  }
};
