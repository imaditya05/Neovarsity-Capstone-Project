const mongoose = require('mongoose');
const Theater = require('../models/Theater');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB (from .env)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-booking';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Get all theaters
    const theaters = await Theater.find({})
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`📋 Total Theaters: ${theaters.length}\n`);
    
    if (theaters.length === 0) {
      console.log('⚠️  No theaters found in the database.');
      console.log('   You need to add theaters first before approving them.\n');
    } else {
      // Group by status
      const pending = theaters.filter(t => t.status === 'pending');
      const approved = theaters.filter(t => t.status === 'approved');
      const rejected = theaters.filter(t => t.status === 'rejected');
      
      console.log('📊 Status Breakdown:');
      console.log(`   ⏳ Pending: ${pending.length}`);
      console.log(`   ✅ Approved: ${approved.length}`);
      console.log(`   ❌ Rejected: ${rejected.length}\n`);
      
      if (pending.length > 0) {
        console.log('⏳ PENDING THEATERS (Need Your Approval):');
        console.log('─'.repeat(60));
        pending.forEach((theater, i) => {
          console.log(`\n${i + 1}. ${theater.theaterName}`);
          console.log(`   📍 Location: ${theater.address.city}, ${theater.address.state}`);
          console.log(`   📞 Phone: ${theater.contact.phone}`);
          console.log(`   🎭 Screens: ${theater.screens.length}`);
          console.log(`   📄 License: ${theater.licenseNumber}`);
          console.log(`   👤 Owner: ${theater.owner?.name || 'N/A'} (${theater.owner?.email || 'N/A'})`);
          console.log(`   🆔 Theater ID: ${theater._id}`);
        });
        console.log('\n' + '─'.repeat(60));
        console.log(`\n💡 Log in to the admin dashboard to approve these theaters:`);
        console.log(`   1. Go to: http://localhost:3000/login`);
        console.log(`   2. Email: admin@moviebooking.com`);
        console.log(`   3. Password: admin123`);
        console.log(`   4. You'll be redirected to: http://localhost:3000/admin/theaters\n`);
      }
      
      if (approved.length > 0) {
        console.log('\n✅ APPROVED THEATERS (Visible to Users):');
        console.log('─'.repeat(60));
        approved.forEach((theater, i) => {
          console.log(`${i + 1}. ${theater.theaterName} - ${theater.address.city}, ${theater.address.state}`);
        });
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });

