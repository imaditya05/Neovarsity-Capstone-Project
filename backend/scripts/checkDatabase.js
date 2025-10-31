const mongoose = require('mongoose');
const Theater = require('../models/Theater');

// Connect to local MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/movie-booking';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Count theaters
    const totalTheaters = await Theater.countDocuments({});
    console.log(`\n🎭 Total theaters in database: ${totalTheaters}`);
    
    // List all theaters with all fields
    if (totalTheaters > 0) {
      const allTheaters = await Theater.find({})
        .select('theaterName status isActive owner address.city')
        .sort({ createdAt: -1 })
        .limit(20);
      
      console.log('\n📋 Theaters found:');
      allTheaters.forEach((theater, i) => {
        console.log(`\n${i + 1}. Theater ID: ${theater._id}`);
        console.log(`   Name: ${theater.theaterName}`);
        console.log(`   City: ${theater.address?.city || 'N/A'}`);
        console.log(`   Status: ${theater.status}`);
        console.log(`   Is Active: ${theater.isActive}`);
        console.log(`   Owner: ${theater.owner}`);
      });
      
      // Count by status
      const statusCounts = await Theater.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('\n📊 Theater status breakdown:');
      statusCounts.forEach(stat => {
        console.log(`  ${stat._id}: ${stat.count}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

