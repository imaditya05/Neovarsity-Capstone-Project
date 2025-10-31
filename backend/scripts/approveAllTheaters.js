const mongoose = require('mongoose');
const Theater = require('../models/Theater');

// Connect to local MongoDB (since user sees data in MongoDB Compass)
const MONGODB_URI = 'mongodb://localhost:27017/movie-booking';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB at', MONGODB_URI))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Approve all pending theaters
const approveAllTheaters = async () => {
  try {
    const result = await Theater.updateMany(
      { status: 'pending' },
      { $set: { status: 'approved' } }
    );

    console.log(`✅ Successfully approved ${result.modifiedCount} theaters`);
    
    // List all theaters
    const allTheaters = await Theater.find({ isActive: true })
      .select('theaterName status address.city')
      .sort({ createdAt: -1 });
    
    console.log('\n📋 All Active Theaters:');
    allTheaters.forEach(theater => {
      console.log(`  - ${theater.theaterName} (${theater.address.city}) - Status: ${theater.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error approving theaters:', error);
    process.exit(1);
  }
};

// Run the script
approveAllTheaters();

