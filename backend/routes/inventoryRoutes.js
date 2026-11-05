const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getInventory);
router.post('/variants/:variantId/adjust', inventoryController.adjustStock);

module.exports = router;

