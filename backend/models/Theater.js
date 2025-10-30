const mongoose = require('mongoose');

// Screen Schema - embedded in Theater
const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: String,
    required: [true, 'Please provide screen number'],
    trim: true
  },
  screenName: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide screen capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  screenType: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos', 'Standard'],
    default: 'Standard'
  },
  // Seat layout configuration
  seatLayout: {
    rows: {
      type: Number,
      required: true,
      default: 10
    },
    seatsPerRow: {
      type: Number,
      required: true,
      default: 15
    },
    // Categories of seats (Premium, Regular, etc.)
    categories: [{
      name: {
        type: String,
        required: true,
        enum: ['Premium', 'Regular', 'VIP', 'Economy']
      },
      rows: [String], // e.g., ['A', 'B', 'C']
      price: {
        type: Number,
        required: true,
        min: 0
      }
    }]
  },
  facilities: [{
    type: String,
    enum: ['Wheelchair Access', 'Recliner Seats', 'Dolby Sound', 'Air Conditioned', 'Food Court']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Theater Schema
const theaterSchema = new mongoose.Schema({
  theaterName: {
    type: String,
    required: [true, 'Please provide theater name'],
    trim: true,
    maxlength: [200, 'Theater name cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      index: true
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    zipCode: {
      type: String,
      match: [/^\d{5,6}$/, 'Please provide a valid zip code']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Please provide contact number'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    }
  },
  // Theater owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // License and legal information
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number']
  },
  // Screens in this theater
  screens: [screenSchema],
  // Theater facilities and amenities
  facilities: [{
    type: String,
    enum: [
      'Parking',
      'Food Court',
      'Wheelchair Access',
      'Online Booking',
      'M-Ticket',
      'Parking',
      'Restrooms',
      'ATM',
      'WiFi'
    ]
  }],
  // Operating hours
  operatingHours: {
    openTime: String,  // e.g., "09:00"
    closeTime: String  // e.g., "23:00"
  },
  // Images
  images: [{
    url: String,
    caption: String
  }],
  // Rating and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  // Admin notes (for approval/rejection)
  adminNotes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
theaterSchema.index({ theaterName: 'text', description: 'text' });
theaterSchema.index({ 'address.city': 1 });
theaterSchema.index({ owner: 1 });
theaterSchema.index({ status: 1 });

// Virtual for total screens
theaterSchema.virtual('totalScreens').get(function() {
  return this.screens.length;
});

// Virtual for total capacity
theaterSchema.virtual('totalCapacity').get(function() {
  return this.screens.reduce((total, screen) => total + screen.capacity, 0);
});

// Virtual for full address
theaterSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.zipCode}`;
});

// Ensure virtuals are included in JSON
theaterSchema.set('toJSON', { virtuals: true });
theaterSchema.set('toObject', { virtuals: true });

// Method to add a screen
theaterSchema.methods.addScreen = function(screenData) {
  this.screens.push(screenData);
  return this.save();
};

// Method to remove a screen
theaterSchema.methods.removeScreen = function(screenId) {
  this.screens = this.screens.filter(screen => screen._id.toString() !== screenId);
  return this.save();
};

module.exports = mongoose.model('Theater', theaterSchema);

