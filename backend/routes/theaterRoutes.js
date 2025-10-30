const express = require('express');
const router = express.Router();
const {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater,
  getMyTheaters,
  addScreen,
  updateScreen,
  deleteScreen,
  updateTheaterStatus,
  getTheaterStats
} = require('../controllers/theaterController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllTheaters);
router.get('/:id', getTheaterById);

// Protected routes - Theater Owner and Admin only
router.post('/', protect, authorize('theater_owner', 'admin'), createTheater);
router.put('/:id', protect, authorize('theater_owner', 'admin'), updateTheater);
router.delete('/:id', protect, authorize('theater_owner', 'admin'), deleteTheater);

// My theaters - for theater owners
router.get('/my/theaters', protect, authorize('theater_owner', 'admin'), getMyTheaters);

// Screen management
router.post('/:id/screens', protect, authorize('theater_owner', 'admin'), addScreen);
router.put('/:id/screens/:screenId', protect, authorize('theater_owner', 'admin'), updateScreen);
router.delete('/:id/screens/:screenId', protect, authorize('theater_owner', 'admin'), deleteScreen);

// Admin routes
router.put('/:id/status', protect, authorize('admin'), updateTheaterStatus);
router.get('/admin/stats', protect, authorize('admin'), getTheaterStats);

module.exports = router;

