const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const driverController = require('../controllers/driverController');

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:id/tracking', driverController.getOrderTracking);
router.post('/:id/assign-driver', driverController.assignOrderToDriver);
router.post('/:id/unassign-driver', driverController.unassignOrderFromDriver);
router.patch('/:id/unassign-driver', driverController.unassignOrderFromDriver);
router.put('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;


