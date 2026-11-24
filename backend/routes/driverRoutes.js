const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Driver App Authentication & Profile
router.post('/auth/login', driverController.login);
router.get('/profile', driverController.getProfile);
router.get('/profile/:id', driverController.getProfile);
router.put('/status', driverController.updateStatus);

// Real-time GPS Location streaming
router.post('/location', driverController.updateLocation);

// Driver Deliveries & Orders Lifecycle
router.get('/deliveries', driverController.getAssignedDeliveries);
router.get('/deliveries/:driverId', driverController.getAssignedDeliveries);
router.put('/deliveries/:id/status', driverController.updateDeliveryStatus);

// Admin Driver & Fleet Management
router.get('/', driverController.getAdminDrivers);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);
router.post('/assign-order/:id', driverController.assignOrderToDriver);

// Customer Live Tracking
router.get('/tracking/:id', driverController.getOrderTracking);

module.exports = router;

