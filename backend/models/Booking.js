const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User who made the booking
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  // Show details
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: [true, 'Show is required']
  },
  
  // Movie and Theater references (for quick access)
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  },
  
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: [true, 'Theater is required']
  },
  
  // Booking details
  showDate: {
    type: Date,
    required: [true, 'Show date is required']
  },
  
  showTime: {
    type: String,
    required: [true, 'Show time is required']
  },
  
  // Seats booked
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  
  // Pricing
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required']
  },
  
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required']
  },
  
  convenienceFee: {
    type: Number,
    default: 0
  },
  
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  
  // Payment details
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'netbanking', 'cash'],
    default: 'cash'
  },
  
  paymentId: {
    type: String // Payment gateway transaction ID
  },
  
  paymentDate: {
    type: Date
  },
  
  // Razorpay specific fields
  razorpay_order_id: {
    type: String
  },
  
  razorpay_payment_id: {
    type: String
  },
  
  razorpay_signature: {
    type: String
  },
  
  // Booking status
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  
  // Booking reference
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // QR Code for ticket verification
  qrCode: {
    type: String
  },
  
  // Cancellation
  cancelledAt: {
    type: Date
  },
  
  cancellationReason: {
    type: String
  },
  
  refundAmount: {
    type: Number,
    default: 0
  },
  
  // Contact details (in case user details change)
  contactDetails: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Generate booking number (fallback if not provided)
bookingSchema.pre('validate', function(next) {
  if (!this.bookingNumber) {
    // Format: BK-YYYYMMDD-RANDOM
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingNumber = `BK-${dateStr}-${random}`;
  }
  next();
});

// Method to cancel booking
bookingSchema.methods.cancelBooking = async function(reason) {
  this.bookingStatus = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  // Calculate refund (simple logic - can be enhanced)
  if (this.paymentStatus === 'completed') {
    const showDateTime = new Date(this.showDate + ' ' + this.showTime);
    const hoursUntilShow = (showDateTime - new Date()) / (1000 * 60 * 60);
    
    if (hoursUntilShow > 24) {
      this.refundAmount = this.totalAmount; // Full refund
    } else if (hoursUntilShow > 2) {
      this.refundAmount = this.totalAmount * 0.5; // 50% refund
    } else {
      this.refundAmount = 0; // No refund
    }
  }
  
  return this.save();
};

// Virtual for formatted booking number
bookingSchema.virtual('formattedBookingNumber').get(function() {
  return this.bookingNumber;
});

// Virtual for seat numbers list
bookingSchema.virtual('seatNumbers').get(function() {
  return this.seats.map(s => s.seatNumber).join(', ');
});

// Ensure virtuals are included in JSON
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);

