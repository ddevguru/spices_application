const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Variant endpoints
router.post('/:productId/variants', productController.addVariant);
router.put('/:productId/variants/:variantId', productController.updateVariant);
router.delete('/:productId/variants/:variantId', productController.deleteVariant);

module.exports = router;

