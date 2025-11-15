const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Authenticated users)
exports.createBooking = async (req, res) => {
  try {
    const {
      showId,
      seats, // Array of seat numbers
      contactDetails
    } = req.body;

    console.log('Creating booking for show:', showId);
    console.log('Seats:', seats);
    console.log('User:', req.user.email);

    // Validate input
    if (!showId || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and seats are required'
      });
    }

    // Get show details
    const show = await Show.findById(showId)
      .populate('movie', 'title posterUrl duration')
      .populate('theater', 'theaterName address');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }

    // Check if show is in the past
    const showDateTime = new Date(show.showDate);
    const [hours, minutes] = show.showTime.split(':');
    showDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    if (showDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book tickets for past shows'
      });
    }

    // Check seat availability
    const bookedSeatNumbers = show.bookedSeats.map(s => s.seatNumber);
    const unavailableSeats = seats.filter(seat => bookedSeatNumbers.includes(seat));

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are already booked`,
        unavailableSeats
      });
    }

    // Calculate pricing
    let subtotal = 0;
    const seatDetails = seats.map(seatNumber => {
      const seatInfo = show.getSeatPrice(seatNumber);
      subtotal += seatInfo.price;
      return {
        seatNumber,
        category: seatInfo.category,
        price: seatInfo.price
      };
    });

    const convenienceFee = show.convenienceFee * seats.length;
    const totalAmount = subtotal + convenienceFee;

    // Get user details
    const user = await User.findById(req.user._id);

    // Generate booking number
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bookingNumber = `BK-${dateStr}-${random}`;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      show: show._id,
      movie: show.movie._id,
      theater: show.theater._id,
      showDate: show.showDate,
      showTime: show.showTime,
      seats: seatDetails,
      totalSeats: seats.length,
      subtotal,
      convenienceFee,
      totalAmount,
      bookingNumber,
      contactDetails: contactDetails || {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

    // Update show's booked seats
    await show.bookSeats(seats, booking._id);

    console.log('Booking created successfully with ID:', booking._id);

    // Try to populate booking for response
    let populatedBooking;
    try {
      populatedBooking = await Booking.findById(booking._id)
        .populate('movie', 'title posterUrl duration rating')
        .populate('theater', 'theaterName address')
        .populate('show', 'showDate showTime format screen')
        .populate('user', 'name email')
        .lean();
      console.log('Booking populated successfully');
    } catch (populateError) {
      console.error('Error populating booking:', populateError.message);
      // If populate fails, return the basic booking
      populatedBooking = booking.toObject();
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.user.email);
    
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) query.bookingStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get basic bookings first
    const basicBookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`Found ${basicBookings.length} bookings`);

    // Try to populate each booking individually
    const bookings = await Promise.all(
      basicBookings.map(async (booking) => {
        try {
          const populated = await Booking.findById(booking._id)
            .populate('movie', 'title posterUrl duration rating')
            .populate('theater', 'theaterName address')
            .populate('show', 'showDate showTime format screen')
            .lean();
          return populated || booking;
        } catch (populateError) {
          console.error(`Error populating booking ${booking._id}:`, populateError.message);
          return booking; // Return unpopulated booking if populate fails
        }
      })
    );

    const total = await Booking.countDocuments(query);

    console.log('Successfully fetched and populated bookings');

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    console.log('Fetching booking:', req.params.id);

    // First, get the basic booking to check if it exists
    const basicBooking = await Booking.findById(req.params.id);

    if (!basicBooking) {
      console.log('Booking not found');
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('Basic booking found, checking authorization...');

    // Check if user owns this booking or is admin
    if (basicBooking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log('User not authorized');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    console.log('User authorized, attempting to populate...');

    // Try to populate the booking
    let booking;
    try {
      booking = await Booking.findById(req.params.id)
        .populate('movie', 'title posterUrl duration rating language')
        .populate('theater', 'theaterName address')
        .populate('show', 'showDate showTime format screen')
        .populate('user', 'name email phone')
        .lean();
      console.log('Booking populated successfully');
    } catch (populateError) {
      console.error('Error populating booking:', populateError.message);
      // If populate fails, use the basic booking
      booking = basicBooking.toObject();
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking is already cancelled
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Check if show has already happened
    const showDateTime = new Date(booking.showDate + ' ' + booking.showTime);
    if (showDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking for past shows'
      });
    }

    // Cancel booking
    await booking.cancelBooking(reason || 'Cancelled by user');

    // Release seats from the show
    const show = await Show.findById(booking.show);
    if (show) {
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      show.bookedSeats = show.bookedSeats.filter(
        seat => !seatNumbers.includes(seat.seatNumber)
      );
      await show.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount: booking.refundAmount
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.bookingStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('theater', 'theaterName')
      .populate('show', 'showDate showTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get booking statistics (Admin only)
// @route   GET /api/bookings/admin/stats
// @access  Private (Admin)
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    // Revenue stats
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Bookings by status
    const statusBreakdown = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        revenue: revenueData[0] || { totalRevenue: 0, avgBookingValue: 0 },
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Update booking payment details
// @route   PUT /api/bookings/:id/payment
// @access  Private
exports.updateBookingPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod
    } = req.body;

    console.log('Updating payment for booking:', req.params.id);

    // Get booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Update payment details
    booking.razorpay_order_id = razorpay_order_id;
    booking.razorpay_payment_id = razorpay_payment_id;
    booking.razorpay_signature = razorpay_signature;
    booking.paymentId = razorpay_payment_id;
    booking.paymentStatus = 'completed';
    booking.paymentDate = new Date();
    booking.paymentMethod = paymentMethod || 'upi';

    await booking.save();

    console.log('Payment details updated successfully');

    // Try to populate booking for response
    let populatedBooking;
    try {
      populatedBooking = await Booking.findById(booking._id)
        .populate('movie', 'title posterUrl duration rating')
        .populate('theater', 'theaterName address')
        .populate('show', 'showDate showTime format screen')
        .populate('user', 'name email')
        .lean();
    } catch (populateError) {
      console.error('Error populating booking:', populateError.message);
      populatedBooking = booking.toObject();
    }

    res.status(200).json({
      success: true,
      message: 'Payment details updated successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Update booking payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment details',
      error: error.message
    });
  }
};

