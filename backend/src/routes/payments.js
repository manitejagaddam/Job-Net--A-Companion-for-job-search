const express = require('express');
const router = express.Router();
const { 
  initiatePayment, 
  verifyPayment, 
  getPaymentHistory, 
  checkPaymentStatus, 
  getPaymentRequirements 
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// GET /payments/requirements (public route)
router.get('/requirements', getPaymentRequirements);

// POST /payments/initiate (protected route)
router.post('/initiate', auth, initiatePayment);

// POST /payments/verify (protected route)
router.post('/verify', auth, verifyPayment);

// GET /payments/history (protected route)
router.get('/history', auth, getPaymentHistory);

// GET /payments/status/:jobId (protected route)
router.get('/status/:jobId', auth, checkPaymentStatus);

module.exports = router; 