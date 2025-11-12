const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  getBookingStats
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// All booking routes require authentication
// Specific routes must come before generic :id routes

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllBookings);
router.get('/admin/stats', protect, authorize('admin'), getBookingStats);

// User routes
router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, createBooking);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;

