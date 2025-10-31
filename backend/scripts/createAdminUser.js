const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB (from .env)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-booking';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\n💡 You can use this account to log in to the admin dashboard.');
      console.log('   If you forgot the password, you can delete this user and run the script again.\n');
      process.exit(0);
    }
    
    // Create new admin user
    const adminData = {
      name: 'Admin User',
      email: 'admin@moviebooking.com',
      password: 'admin123',  // You should change this after first login
      role: 'admin',
      phone: '9999999999'
    };
    
    const admin = await User.create(adminData);
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n🔐 IMPORTANT: Please change the password after first login!\n');
    console.log('🎯 Access the admin dashboard at: http://localhost:3000/admin/theaters\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

