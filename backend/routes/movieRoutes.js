const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getMyMovies,
  getMovieStats
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// Protected routes - Theater Owner and Admin only
router.post('/', protect, authorize('theater_owner', 'admin'), createMovie);
router.put('/:id', protect, authorize('theater_owner', 'admin'), updateMovie);
router.delete('/:id', protect, authorize('theater_owner', 'admin'), deleteMovie);

// My movies - for theater owners to see their own movies
router.get('/my/movies', protect, authorize('theater_owner', 'admin'), getMyMovies);

// Statistics - Admin only
router.get('/admin/stats', protect, authorize('admin'), getMovieStats);

module.exports = router;

