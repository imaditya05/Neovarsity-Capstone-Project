const Theater = require('../models/Theater');

// @desc    Get all theaters
// @route   GET /api/theaters
// @access  Public
exports.getAllTheaters = async (req, res) => {
  try {
    const {
      city,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Only show approved theaters to public
    if (!req.user || req.user.role === 'user') {
      query.status = 'approved';
    } else if (req.user.role === 'theater_owner') {
      // Theater owners see only their own theaters
      query.owner = req.user.id;
    }
    // Admins see all theaters

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (status && (req.user?.role === 'admin' || req.user?.role === 'theater_owner')) {
      query.status = status;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query
    const theaters = await Theater.find(query)
      .populate('owner', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Theater.countDocuments(query);

    res.status(200).json({
      success: true,
      count: theaters.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: theaters
    });
  } catch (error) {
    console.error('Get all theaters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching theaters',
      error: error.message
    });
  }
};

// @desc    Get single theater by ID
// @route   GET /api/theaters/:id
// @access  Public
exports.getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // Check if user can view this theater
    if (theater.status !== 'approved' && 
        (!req.user || (req.user.role !== 'admin' && theater.owner._id.toString() !== req.user.id))) {
      return res.status(403).json({
        success: false,
        message: 'Theater not available'
      });
    }

    res.status(200).json({
      success: true,
      data: theater
    });
  } catch (error) {
    console.error('Get theater by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching theater',
      error: error.message
    });
  }
};

// @desc    Create new theater
// @route   POST /api/theaters
// @access  Private (Theater Owner, Admin)
exports.createTheater = async (req, res) => {
  try {
    const theaterData = {
      ...req.body,
      owner: req.user.id
    };

    // If user is theater owner, auto-approve for now (admin approval can be added later)
    if (req.user.role === 'theater_owner') {
      theaterData.status = 'pending'; // Will need admin approval
    } else if (req.user.role === 'admin') {
      theaterData.status = 'approved'; // Admin can directly approve
    }

    const theater = await Theater.create(theaterData);

    res.status(201).json({
      success: true,
      message: 'Theater created successfully',
      data: theater
    });
  } catch (error) {
    console.error('Create theater error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating theater',
      error: error.message
    });
  }
};

// @desc    Update theater
// @route   PUT /api/theaters/:id
// @access  Private (Theater Owner - own, Admin - all)
exports.updateTheater = async (req, res) => {
  try {
    let theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // Check ownership
    if (req.user.role === 'theater_owner' && theater.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this theater'
      });
    }

    // Update theater
    theater = await Theater.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Theater updated successfully',
      data: theater
    });
  } catch (error) {
    console.error('Update theater error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating theater',
      error: error.message
    });
  }
};

// @desc    Delete theater (soft delete)
// @route   DELETE /api/theaters/:id
// @access  Private (Theater Owner - own, Admin - all)
exports.deleteTheater = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // Check ownership
    if (req.user.role === 'theater_owner' && theater.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this theater'
      });
    }

    // Soft delete
    theater.isActive = false;
    await theater.save();

    res.status(200).json({
      success: true,
      message: 'Theater deleted successfully'
    });
  } catch (error) {
    console.error('Delete theater error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting theater',
      error: error.message
    });
  }
};

// @desc    Get my theaters (for theater owners)
// @route   GET /api/theaters/my/theaters
// @access  Private (Theater Owner, Admin)
exports.getMyTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find({ 
      owner: req.user.id, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: theaters.length,
      data: theaters
    });
  } catch (error) {
    console.error('Get my theaters error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your theaters',
      error: error.message
    });
  }
};

// @desc    Add screen to theater
// @route   POST /api/theaters/:id/screens
// @access  Private (Theater Owner - own, Admin - all)
exports.addScreen = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // Check ownership
    if (req.user.role === 'theater_owner' && theater.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this theater'
      });
    }

    // Add screen
    theater.screens.push(req.body);
    await theater.save();

    res.status(201).json({
      success: true,
      message: 'Screen added successfully',
      data: theater
    });
  } catch (error) {
    console.error('Add screen error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding screen',
      error: error.message
    });
  }
};

// @desc    Update screen
// @route   PUT /api/theaters/:id/screens/:screenId
// @access  Private (Theater Owner - own, Admin - all)
exports.updateScreen = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // Check ownership
    if (req.user.role === 'theater_owner' && theater.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this theater'
      });
    }

    // Find and update screen
    const screen = theater.screens.id(req.params.screenId);
    if (!screen) {
      return res.status(404).json({
        success: false,
        message: 'Screen not found'
      });
    }

    // Update screen fields
    Object.assign(screen, req.body);
    await theater.save();

    res.status(200).json({
      success: true,
      message: 'Screen updated successfully',
      data: theater
    });
  } catch (error) {
    console.error('Update screen error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating screen',
      error: error.message
    });
  }
};

// @desc    Delete screen
// @route   DELETE /api/theaters/:id/screens/:screenId
// @access  Private (Theater Owner - own, Admin - all)
exports.deleteScreen = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    // Check ownership
    if (req.user.role === 'theater_owner' && theater.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this theater'
      });
    }

    // Remove screen
    theater.screens = theater.screens.filter(
      screen => screen._id.toString() !== req.params.screenId
    );
    await theater.save();

    res.status(200).json({
      success: true,
      message: 'Screen deleted successfully',
      data: theater
    });
  } catch (error) {
    console.error('Delete screen error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting screen',
      error: error.message
    });
  }
};

// @desc    Approve/reject theater (Admin only)
// @route   PUT /api/theaters/:id/status
// @access  Private (Admin)
exports.updateTheaterStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const theater = await Theater.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );

    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Theater not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Theater ${status} successfully`,
      data: theater
    });
  } catch (error) {
    console.error('Update theater status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating theater status',
      error: error.message
    });
  }
};

// @desc    Get theater statistics (Admin)
// @route   GET /api/theaters/admin/stats
// @access  Private (Admin)
exports.getTheaterStats = async (req, res) => {
  try {
    const stats = await Theater.aggregate([
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

    const cityStats = await Theater.aggregate([
      {
        $match: { isActive: true, status: 'approved' }
      },
      {
        $group: {
          _id: '$address.city',
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

    const totalTheaters = await Theater.countDocuments({ isActive: true });
    const totalScreens = await Theater.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $project: { screenCount: { $size: '$screens' } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$screenCount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTheaters,
        totalScreens: totalScreens[0]?.total || 0,
        statusBreakdown: stats,
        topCities: cityStats
      }
    });
  } catch (error) {
    console.error('Get theater stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching theater statistics',
      error: error.message
    });
  }
};

