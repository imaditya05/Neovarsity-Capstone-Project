const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  // Movie and Theater references
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Please provide a movie']
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: [true, 'Please provide a theater']
  },
  
  // Screen/Hall information
  screen: {
    screenNumber: {
      type: Number,
      required: [true, 'Please provide screen number']
    },
    screenName: {
      type: String,
      required: [true, 'Please provide screen name']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please provide total seats']
    }
  },

  // Show timing
  showDate: {
    type: Date,
    required: [true, 'Please provide show date']
  },
  showTime: {
    type: String, // Format: "HH:MM" (24-hour format)
    required: [true, 'Please provide show time']
  },
  
  // Seat configuration
  seatLayout: {
    rows: {
      type: Number,
      required: true,
      default: 10
    },
    columns: {
      type: Number,
      required: true,
      default: 15
    },
    categories: [{
      name: {
        type: String, // e.g., "Regular", "Premium", "VIP"
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      seats: [{
        type: String // e.g., "A1", "A2", "B1"
      }]
    }]
  },

  // Seat availability tracking
  bookedSeats: [{
    seatNumber: String,
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  }],

  // Pricing (can vary by show)
  basePrice: {
    type: Number,
    required: [true, 'Please provide base price'],
    min: [0, 'Price cannot be negative']
  },

  // Show status
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },

  // Convenience fee
  convenienceFee: {
    type: Number,
    default: 0
  },

  // Languages (for multilingual movies)
  language: {
    type: String,
    default: 'English'
  },

  // Experience type
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos'],
    default: '2D'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
showSchema.index({ movie: 1, showDate: 1, showTime: 1 });
showSchema.index({ theater: 1, showDate: 1 });
showSchema.index({ showDate: 1, status: 1 });

// Virtual for available seats count
showSchema.virtual('availableSeats').get(function() {
  return this.screen.totalSeats - this.bookedSeats.length;
});

// Virtual for show date-time combined
showSchema.virtual('showDateTime').get(function() {
  const date = new Date(this.showDate);
  const [hours, minutes] = this.showTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Method to check if a seat is available
showSchema.methods.isSeatAvailable = function(seatNumber) {
  return !this.bookedSeats.some(seat => seat.seatNumber === seatNumber);
};

// Method to book seats
showSchema.methods.bookSeats = function(seatNumbers, bookingId) {
  const seatsToBook = seatNumbers.map(seatNumber => ({
    seatNumber,
    booking: bookingId
  }));
  this.bookedSeats.push(...seatsToBook);
  return this.save();
};

// Method to get seat category and price
showSchema.methods.getSeatPrice = function(seatNumber) {
  for (const category of this.seatLayout.categories) {
    if (category.seats.includes(seatNumber)) {
      return {
        category: category.name,
        price: category.price
      };
    }
  }
  return {
    category: 'Regular',
    price: this.basePrice
  };
};

// Static method to get shows by movie
showSchema.statics.getShowsByMovie = function(movieId, filters = {}) {
  const query = { 
    movie: movieId, 
    isActive: true,
    status: { $in: ['scheduled', 'ongoing'] }
  };
  
  if (filters.date) {
    const startDate = new Date(filters.date);
    const endDate = new Date(filters.date);
    endDate.setHours(23, 59, 59, 999);
    query.showDate = { $gte: startDate, $lte: endDate };
  }
  
  if (filters.theater) {
    query.theater = filters.theater;
  }
  
  return this.find(query)
    .populate('theater', 'theaterName address')
    .sort({ showDate: 1, showTime: 1 });
};

// Static method to get shows by theater
showSchema.statics.getShowsByTheater = function(theaterId, filters = {}) {
  const query = { 
    theater: theaterId, 
    isActive: true,
    status: { $in: ['scheduled', 'ongoing'] }
  };
  
  if (filters.date) {
    const startDate = new Date(filters.date);
    const endDate = new Date(filters.date);
    endDate.setHours(23, 59, 59, 999);
    query.showDate = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(query)
    .populate('movie', 'title posterUrl duration rating')
    .sort({ showDate: 1, showTime: 1 });
};

// Automatically update status based on show date/time
showSchema.pre('save', function(next) {
  const now = new Date();
  const showDateTime = this.showDateTime;
  
  if (showDateTime < now && this.status === 'scheduled') {
    // If show time has passed and status is still scheduled, mark as completed
    const movieDuration = 180; // Default 3 hours if movie duration not available
    const showEndTime = new Date(showDateTime.getTime() + movieDuration * 60000);
    
    if (now > showEndTime) {
      this.status = 'completed';
    } else {
      this.status = 'ongoing';
    }
  }
  
  next();
});

// Ensure virtuals are included in JSON
showSchema.set('toJSON', { virtuals: true });
showSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Show', showSchema);

