const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Customer Auth
router.post('/register', authController.customerRegister);
router.post('/customer-register', authController.customerRegister);
router.post('/login', authController.customerLogin);
router.post('/customer-login', authController.customerLogin);
router.get('/me', authController.getMe);
router.get('/profile', authController.getMe);

// Admin Auth
router.post('/admin-login', authController.adminLogin);

module.exports = router;

