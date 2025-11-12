const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

// @desc    Get all shows with filters
// @route   GET /api/shows
// @access  Public
exports.getAllShows = async (req, res) => {
  try {
    const {
      movie,
      theater,
      date,
      status,
      format,
      sortBy = 'showDate',
      order = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    console.log('getAllShows called with query:', req.query);

    // Build query - also ensure movie and theater are not null
    const query = { 
      isActive: true,
      movie: { $ne: null, $exists: true },
      theater: { $ne: null, $exists: true }
    };

    if (movie) query.movie = movie;
    if (theater) query.theater = theater;
    if (status) query.status = status;
    if (format) query.format = format;
    
    // Date filtering
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.showDate = { $gte: startDate, $lte: endDate };
    }
    // Note: If no date filter, show all shows (past and future) for easier testing
    // In production, you might want to uncomment the line below:
    // else { query.showDate = { $gte: new Date() }; }

    console.log('Query built:', JSON.stringify(query));

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };
    if (sortBy === 'showDate') {
      sortOptions.showTime = sortOrder;
    }

    console.log('Executing Show.find...');

    // Execute query without populate first to debug
    const showsRaw = await Show.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for plain objects

    console.log(`Found ${showsRaw.length} shows`);

    // Manually populate to catch errors
    const shows = [];
    for (const show of showsRaw) {
      try {
        const populatedShow = await Show.findById(show._id)
          .populate('movie', 'title posterUrl duration rating language')
          .populate('theater', 'theaterName address')
          .populate('createdBy', 'name email')
          .lean();
        
        if (populatedShow) {
          shows.push(populatedShow);
        }
      } catch (populateError) {
        console.error(`Error populating show ${show._id}:`, populateError.message);
        // Skip this show if there's an error
      }
    }

    console.log(`Successfully populated ${shows.length} shows`);

    // Get total count
    const total = await Show.countDocuments(query);

    res.status(200).json({
      success: true,
      count: shows.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: shows
    });
  } catch (error) {
    console.error('Get all shows error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching shows',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get single show by ID
// @route   GET /api/shows/:id
// @access  Public
exports.getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theater')
      .populate('createdBy', 'name email');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    res.status(200).json({
      success: true,
      data: show
    });
  } catch (error) {
    console.error('Get show error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching show',
      error: error.message
    });
  }
};

// @desc    Create new show
// @route   POST /api/shows
// @access  Private (Theater Owner, Admin)
exports.createShow = async (req, res) => {
  try {
    console.log('Creating show with data:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user.email, 'Role:', req.user.role);
    
    const {
      movie,
      theater,
      screen,
      showDate,
      showTime,
      seatLayout,
      basePrice,
      convenienceFee,
      language,
      format
    } = req.body;

    // Verify movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Verify theater exists
    const theaterExists = await Theater.findById(theater);
    if (!theaterExists) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // For theater owners, verify they own the theater
    if (req.user.role === 'theater_owner') {
      if (theaterExists.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only create shows for your own theaters'
        });
      }
    }

    // Check for conflicts (same theater, screen, date, time)
    const conflictingShow = await Show.findOne({
      theater,
      'screen.screenNumber': screen.screenNumber,
      showDate: new Date(showDate),
      showTime,
      isActive: true,
      status: { $in: ['scheduled', 'ongoing'] }
    });

    if (conflictingShow) {
      return res.status(400).json({
        success: false,
        message: 'A show is already scheduled for this screen at this time'
      });
    }

    // Create show
    const show = await Show.create({
      movie,
      theater,
      screen,
      showDate,
      showTime,
      seatLayout,
      basePrice,
      convenienceFee: convenienceFee || 0,
      language: language || movieExists.language,
      format: format || '2D',
      createdBy: req.user._id
    });

    console.log('Show created successfully with ID:', show._id);

    // Try to populate, but if it fails, return the basic show
    let populatedShow;
    try {
      populatedShow = await Show.findById(show._id)
        .populate('movie', 'title posterUrl duration')
        .populate('theater', 'theaterName address')
        .lean();
      console.log('Show populated successfully');
    } catch (populateError) {
      console.error('Error populating show:', populateError.message);
      // If populate fails, return the show without population
      populatedShow = show.toObject();
    }

    res.status(201).json({
      success: true,
      message: 'Show created successfully',
      data: populatedShow
    });
  } catch (error) {
    console.error('Create show error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
        details: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating show',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private (Theater Owner - own shows, Admin - all)
exports.updateShow = async (req, res) => {
  try {
    let show = await Show.findById(req.params.id).populate('theater');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Check permissions
    if (req.user.role === 'theater_owner') {
      if (show.theater.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update shows for your own theaters'
        });
      }
    }

    // Don't allow updating if show has bookings
    if (show.bookedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update show with existing bookings. Cancel bookings first.'
      });
    }

    // Update show
    const allowedUpdates = [
      'showDate',
      'showTime',
      'basePrice',
      'convenienceFee',
      'language',
      'format',
      'status',
      'seatLayout'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        show[field] = req.body[field];
      }
    });

    await show.save();

    show = await Show.findById(show._id)
      .populate('movie', 'title posterUrl duration')
      .populate('theater', 'theaterName address');

    res.status(200).json({
      success: true,
      message: 'Show updated successfully',
      data: show
    });
  } catch (error) {
    console.error('Update show error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating show',
      error: error.message
    });
  }
};

// @desc    Delete show (soft delete)
// @route   DELETE /api/shows/:id
// @access  Private (Theater Owner - own shows, Admin - all)
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id).populate('theater');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Check permissions
    if (req.user.role === 'theater_owner') {
      if (show.theater.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete shows for your own theaters'
        });
      }
    }

    // Don't allow deletion if show has bookings
    if (show.bookedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete show with existing bookings. Mark as cancelled instead.'
      });
    }

    show.isActive = false;
    await show.save();

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully'
    });
  } catch (error) {
    console.error('Delete show error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting show',
      error: error.message
    });
  }
};

// @desc    Get shows by movie
// @route   GET /api/shows/movie/:movieId
// @access  Public
exports.getShowsByMovie = async (req, res) => {
  try {
    const { date, theater, city } = req.query;
    
    const filters = {};
    if (date) filters.date = date;
    if (theater) filters.theater = theater;

    let shows = await Show.getShowsByMovie(req.params.movieId, filters);

    // Filter by city if provided
    if (city) {
      shows = shows.filter(show => 
        show.theater.address.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Group shows by theater and date
    const groupedShows = {};
    shows.forEach(show => {
      const theaterId = show.theater._id.toString();
      const dateKey = new Date(show.showDate).toISOString().split('T')[0];
      
      if (!groupedShows[theaterId]) {
        groupedShows[theaterId] = {
          theater: show.theater,
          dates: {}
        };
      }
      
      if (!groupedShows[theaterId].dates[dateKey]) {
        groupedShows[theaterId].dates[dateKey] = [];
      }
      
      groupedShows[theaterId].dates[dateKey].push(show);
    });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: {
        shows,
        grouped: groupedShows
      }
    });
  } catch (error) {
    console.error('Get shows by movie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shows',
      error: error.message
    });
  }
};

// @desc    Get shows by theater
// @route   GET /api/shows/theater/:theaterId
// @access  Public
exports.getShowsByTheater = async (req, res) => {
  try {
    const { date } = req.query;
    
    const filters = {};
    if (date) filters.date = date;

    const shows = await Show.getShowsByTheater(req.params.theaterId, filters);

    // Group shows by date
    const groupedByDate = {};
    shows.forEach(show => {
      const dateKey = new Date(show.showDate).toISOString().split('T')[0];
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      
      groupedByDate[dateKey].push(show);
    });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: {
        shows,
        grouped: groupedByDate
      }
    });
  } catch (error) {
    console.error('Get shows by theater error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shows',
      error: error.message
    });
  }
};

// @desc    Get my shows (for theater owners)
// @route   GET /api/shows/my/shows
// @access  Private (Theater Owner, Admin)
exports.getMyShows = async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'theater_owner') {
      // Get theaters owned by this user
      const theaters = await Theater.find({ owner: req.user._id });
      const theaterIds = theaters.map(t => t._id);
      query.theater = { $in: theaterIds };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title posterUrl duration rating')
      .populate('theater', 'theaterName address')
      .sort({ showDate: -1, showTime: -1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows
    });
  } catch (error) {
    console.error('Get my shows error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shows',
      error: error.message
    });
  }
};

// @desc    Get show seat availability
// @route   GET /api/shows/:id/seats
// @access  Public
exports.getShowSeats = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Build seat map with availability
    const seatMap = [];
    const bookedSeatNumbers = show.bookedSeats.map(s => s.seatNumber);

    show.seatLayout.categories.forEach(category => {
      category.seats.forEach(seatNumber => {
        seatMap.push({
          seatNumber,
          category: category.name,
          price: category.price,
          isBooked: bookedSeatNumbers.includes(seatNumber)
        });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalSeats: show.screen.totalSeats,
        availableSeats: show.availableSeats,
        bookedSeats: show.bookedSeats.length,
        seatLayout: show.seatLayout,
        seats: seatMap
      }
    });
  } catch (error) {
    console.error('Get show seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seat availability',
      error: error.message
    });
  }
};

// @desc    Get show statistics (Admin only)
// @route   GET /api/shows/admin/stats
// @access  Private (Admin)
exports.getShowStats = async (req, res) => {
  try {
    const totalShows = await Show.countDocuments({ isActive: true });
    
    const statusBreakdown = await Show.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formatBreakdown = await Show.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$format', count: { $sum: 1 } } }
    ]);

    // Shows by date (next 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const upcomingShows = await Show.countDocuments({
      isActive: true,
      showDate: { $gte: today, $lte: next7Days },
      status: 'scheduled'
    });

    // Average occupancy
    const occupancyData = await Show.aggregate([
      { $match: { isActive: true, status: { $in: ['ongoing', 'completed'] } } },
      {
        $project: {
          occupancy: {
            $multiply: [
              { $divide: [{ $size: '$bookedSeats' }, '$screen.totalSeats'] },
              100
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgOccupancy: { $avg: '$occupancy' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalShows,
        statusBreakdown,
        formatBreakdown,
        upcomingShows,
        averageOccupancy: occupancyData[0]?.avgOccupancy || 0
      }
    });
  } catch (error) {
    console.error('Get show stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

