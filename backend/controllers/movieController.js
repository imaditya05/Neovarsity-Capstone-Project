const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getAllMovies = async (req, res) => {
  try {
    const {
      status,
      genre,
      language,
      search,
      sortBy = 'releaseDate',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (status) query.status = status;
    if (genre) query.genre = genre;
    if (language) query.language = language;
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query
    const movies = await Movie.find(query)
      .populate('addedBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: movies
    });
  } catch (error) {
    console.error('Get all movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movies',
      error: error.message
    });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('addedBy', 'name email role')
      .populate('theater', 'theaterName city');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Get movie by ID error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching movie',
      error: error.message
    });
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private (Theater Owner, Admin)
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      rating,
      posterUrl,
      trailerUrl,
      cast,
      director,
      producers,
      status,
      theater
    } = req.body;

    // Add the user who created this movie
    const movieData = {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      rating,
      posterUrl,
      trailerUrl,
      cast,
      director,
      producers,
      status,
      addedBy: req.user.id
    };

    // If theater is provided, add it to movie data
    // Note: Theater management system will be built next, making this optional for now
    if (theater) {
      movieData.theater = theater;
    }

    const movie = await Movie.create(movieData);

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie
    });
  } catch (error) {
    console.error('Create movie error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating movie',
      error: error.message
    });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private (Theater Owner - own movies, Admin - all)
exports.updateMovie = async (req, res) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership - theater owners can only update their own movies
    if (req.user.role === 'theater_owner' && movie.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this movie'
      });
    }

    // Update movie
    movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    console.error('Update movie error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating movie',
      error: error.message
    });
  }
};

// @desc    Delete movie (soft delete)
// @route   DELETE /api/movies/:id
// @access  Private (Theater Owner - own movies, Admin - all)
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership - theater owners can only delete their own movies
    if (req.user.role === 'theater_owner' && movie.addedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this movie'
      });
    }

    // Soft delete
    movie.isActive = false;
    await movie.save();

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);

    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting movie',
      error: error.message
    });
  }
};

// @desc    Get movies by current user (for theater owners)
// @route   GET /api/movies/my-movies
// @access  Private (Theater Owner, Admin)
exports.getMyMovies = async (req, res) => {
  try {
    const query = { addedBy: req.user.id, isActive: true };

    const movies = await Movie.find(query)
      .populate('theater', 'theaterName city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    console.error('Get my movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your movies',
      error: error.message
    });
  }
};

// @desc    Get movies statistics
// @route   GET /api/movies/stats
// @access  Private (Admin)
exports.getMovieStats = async (req, res) => {
  try {
    const stats = await Movie.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const genreStats = await Movie.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $unwind: '$genre'
      },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    const totalMovies = await Movie.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        statusBreakdown: stats,
        topGenres: genreStats
      }
    });
  } catch (error) {
    console.error('Get movie stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movie statistics',
      error: error.message
    });
  }
};

