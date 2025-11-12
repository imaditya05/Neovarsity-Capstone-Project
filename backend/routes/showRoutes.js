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

// Public routes
router.get('/', getAllShows);
router.get('/:id', getShowById);
router.get('/:id/seats', getShowSeats);
router.get('/movie/:movieId', getShowsByMovie);
router.get('/theater/:theaterId', getShowsByTheater);

// Protected routes - Theater Owner & Admin
router.post('/', protect, authorize('theater_owner', 'admin'), createShow);
router.put('/:id', protect, authorize('theater_owner', 'admin'), updateShow);
router.delete('/:id', protect, authorize('theater_owner', 'admin'), deleteShow);
router.get('/my/shows', protect, authorize('theater_owner', 'admin'), getMyShows);

// Admin only routes
router.get('/admin/stats', protect, authorize('admin'), getShowStats);

module.exports = router;

