const express = require('express');
const router = express.Router();
const {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  getShowsByMovie,
  getShowsByTheater,
  getMyShows,
  getShowSeats,
  getShowStats
} = require('../controllers/showController');
const { protect, authorize } = require('../middleware/auth');

// Specific routes must come BEFORE generic :id routes
// Protected routes - Theater Owner & Admin
router.get('/my/shows', protect, authorize('theater_owner', 'admin'), getMyShows);

// Admin only routes
router.get('/admin/stats', protect, authorize('admin'), getShowStats);

// Public specific routes
router.get('/movie/:movieId', getShowsByMovie);
router.get('/theater/:theaterId', getShowsByTheater);

// Public routes with :id (must come after specific routes)
router.get('/:id/seats', getShowSeats);
router.get('/:id', getShowById);
router.get('/', getAllShows);

// Protected CRUD routes
router.post('/', protect, authorize('theater_owner', 'admin'), createShow);
router.put('/:id', protect, authorize('theater_owner', 'admin'), updateShow);
router.delete('/:id', protect, authorize('theater_owner', 'admin'), deleteShow);

module.exports = router;

