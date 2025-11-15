const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  getRazorpayKey
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Public route - Get Razorpay key
router.get('/key', getRazorpayKey);

// Protected routes - Require authentication
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:paymentId', protect, getPaymentDetails);

// Admin/Theater Owner only - Refund
router.post('/:paymentId/refund', protect, authorize('admin', 'theater_owner'), refundPayment);

module.exports = router;

