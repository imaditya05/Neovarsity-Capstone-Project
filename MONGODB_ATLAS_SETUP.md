# 📊 MongoDB Atlas Setup Guide

Complete guide to set up MongoDB Atlas for your Movie Booking Platform.

---

## 🎯 Why MongoDB Atlas?

✅ **Free Tier Available** - 512MB storage free forever  
✅ **Managed Service** - No server maintenance  
✅ **Auto Backups** - Daily backups included  
✅ **Global Distribution** - Deploy near your users  
✅ **High Availability** - 99.995% uptime SLA  
✅ **Security** - Encryption at rest and in transit  

---

## 📝 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign In"**
3. Sign up with:
   - Email
   - Google account
   - GitHub account
4. Verify your email

---

### Step 2: Create Organization

1. After login, you'll be prompted to create an organization
2. **Organization Name**: `Movie Booking Platform`
3. **Cloud Service**: MongoDB Atlas
4. Click **"Next"**

---

### Step 3: Create Project

1. **Project Name**: `Production`
2. Click **"Next"**
3. Skip adding members (click **"Create Project"**)

---

### Step 4: Create Database Cluster

#### 4.1: Choose Deployment Type
- Click **"Build a Database"**
- Select **"Shared"** (FREE tier)

#### 4.2: Choose Cloud Provider & Region
- **Cloud Provider**: Google Cloud (to match Cloud Run)
- **Region**: `us-central1` (Iowa) or closest to your Cloud Run region
- **Cluster Tier**: M0 Sandbox (FREE - 512MB)
- **Cluster Name**: `movie-booking-prod`

#### 4.3: Additional Settings (Optional)
- **MongoDB Version**: 7.0 (default - latest)
- **Backup**: Disabled on free tier (enable on paid tier)

Click **"Create"** - Takes 3-5 minutes to provision

---

### Step 5: Security - Create Database User

1. **Security Quickstart** will appear
2. Choose **"Username and Password"**
3. **Username**: `movie-booking-api`
4. **Password**: Click **"Autogenerate Secure Password"**
   - 📋 **IMPORTANT**: Copy and save this password securely!
   - Or create your own strong password
5. Click **"Create User"**

---

### Step 6: Network Access - Whitelist IP Addresses

1. **Where would you like to connect from?**
2. Select **"Cloud Environment"**
3. Click **"Add IP Address"**
4. **Add a connection IP address**:
   - Click **"Allow Access from Anywhere"**
   - IP Address: `0.0.0.0/0`
   - Description: `Cloud Run (Serverless)`
5. Click **"Add Entry"**

⚠️ **Why 0.0.0.0/0?**
- Cloud Run uses dynamic IPs
- Cannot whitelist specific IPs
- MongoDB Atlas has other security layers (username/password, encryption)

**Optional: Additional Security**
- Use MongoDB Atlas IP Access List
- Enable VPC Peering (requires paid tier)
- Use MongoDB Realm for API access

---

### Step 7: Connect to Your Cluster

1. Click **"Finish and Close"**
2. Click **"Go to Databases"**
3. You'll see your cluster: `movie-booking-prod`
4. Click **"Connect"** button

---

### Step 8: Get Connection String

#### 8.1: Choose Connection Method
- Select **"Connect your application"**

#### 8.2: Select Driver and Version
- **Driver**: Node.js
- **Version**: 5.5 or later

#### 8.3: Copy Connection String
You'll see a connection string like:
```
mongodb+srv://movie-booking-api:<password>@movie-booking-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

#### 8.4: Modify Connection String
1. Replace `<password>` with your actual database user password
2. Add database name after `.net/`:

**Final Connection String:**
```
mongodb+srv://movie-booking-api:YOUR_ACTUAL_PASSWORD@movie-booking-prod.xxxxx.mongodb.net/movie-booking?retryWrites=true&w=majority
```

📋 **Save this connection string - you'll need it for deployment!**

---

### Step 9: Create Database and Collections

MongoDB will automatically create the database and collections when your app first connects, but you can pre-create them:

1. Click **"Browse Collections"**
2. Click **"Add My Own Data"**
3. **Database Name**: `movie-booking`
4. **Collection Name**: `users`
5. Click **"Create"**

Your app will auto-create these collections:
- `users`
- `movies`
- `theaters`
- `shows`
- `bookings`

---

### Step 10: Test Connection

#### Option 1: Using MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Open Compass
3. Paste your connection string
4. Click **"Connect"**
5. You should see your `movie-booking` database

#### Option 2: Using Node.js

Create a test file:

```javascript
// test-connection.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://movie-booking-api:YOUR_PASSWORD@movie-booking-prod.xxxxx.mongodb.net/movie-booking?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
```

Run:
```bash
node test-connection.js
```

---

## 🔐 Security Best Practices

### 1. Strong Passwords
- Use auto-generated passwords
- At least 16 characters
- Mix of uppercase, lowercase, numbers, symbols

### 2. Multiple Database Users
Create separate users for different environments:

```
dev-user        (Development)
staging-user    (Staging)
prod-user       (Production)
admin-user      (Admin only - full access)
```

### 3. Read-Only Users
For analytics/reporting:
1. Database Access → Add New Database User
2. Built-in Role: **"Read any database"**

### 4. Connection String Security
- ✅ Store in environment variables
- ✅ Use Google Secret Manager
- ❌ Never commit to Git
- ❌ Never hardcode in source files

---

## 📊 Database Monitoring

### View Metrics

1. Go to your cluster dashboard
2. Click **"Metrics"** tab
3. Monitor:
   - Operations per second
   - Network traffic
   - Connections
   - Query performance
   - Storage usage

### Set Up Alerts

1. **Alerts** → **"Create Alert"**
2. Configure alerts for:
   - High CPU usage (> 80%)
   - High disk usage (> 80%)
   - Replication lag
   - Failed connections

---

## 📦 Backup and Restore

### Automatic Backups (Paid Tiers)

1. **Backup** tab in cluster dashboard
2. Enable **Continuous Backup**
3. Set retention period (7-365 days)
4. Snapshots every 24 hours

### Manual Backup (Free Tier)

Use `mongodump`:

```bash
# Export entire database
mongodump --uri="mongodb+srv://movie-booking-api:PASSWORD@cluster.mongodb.net/movie-booking"

# Restore
mongorestore --uri="mongodb+srv://movie-booking-api:PASSWORD@cluster.mongodb.net/movie-booking" dump/
```

---

## 🚀 Performance Optimization

### Create Indexes

In MongoDB Compass or Atlas UI:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Movies collection
db.movies.createIndex({ title: 'text', description: 'text' });
db.movies.createIndex({ status: 1, releaseDate: -1 });

// Shows collection
db.shows.createIndex({ movie: 1, theater: 1, showDate: 1 });
db.shows.createIndex({ showDate: 1, showTime: 1 });

// Bookings collection
db.bookings.createIndex({ user: 1, createdAt: -1 });
db.bookings.createIndex({ show: 1 });
db.bookings.createIndex({ bookingNumber: 1 }, { unique: true });
db.bookings.createIndex({ paymentStatus: 1 });
```

These indexes are already created by your Mongoose schemas!

### Query Performance

1. Use **Performance Advisor** (Atlas tab)
2. Review slow queries
3. Add suggested indexes
4. Monitor query patterns

---

## 💰 Upgrade Options

### When to Upgrade from Free Tier?

Consider upgrading when:
- Storage > 512MB
- More than 100 concurrent connections
- Need backups
- Need better performance
- Need dedicated cluster

### Pricing Tiers

| Tier | Storage | RAM | Price |
|------|---------|-----|-------|
| M0 (Free) | 512MB | Shared | $0 |
| M2 | 2GB | Shared | $9/mo |
| M5 | 5GB | Shared | $25/mo |
| M10 | 10GB | 2GB | $57/mo |
| M20 | 20GB | 4GB | $109/mo |

[Full Pricing Details](https://www.mongodb.com/pricing)

---

## 🔄 Migration from Local MongoDB

If you have data in local MongoDB:

### Export from Local

```bash
# Export all collections
mongodump --db movie-booking --out ./backup

# Or export specific collection
mongoexport --db movie-booking --collection users --out users.json
```

### Import to Atlas

```bash
# Import entire database
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/movie-booking" ./backup/movie-booking

# Or import specific collection
mongoimport --uri="mongodb+srv://user:pass@cluster.mongodb.net/movie-booking" --collection users --file users.json
```

---

## 🐛 Troubleshooting

### Issue: "Could not connect to any servers"
**Solution**:
- Check IP whitelist (0.0.0.0/0 should be added)
- Verify username and password
- Check internet connection

### Issue: "Authentication failed"
**Solution**:
- Verify password (no extra spaces)
- Check username is correct
- Ensure user has correct permissions

### Issue: "Connection timeout"
**Solution**:
- Check network/firewall settings
- Verify cluster is running (green status)
- Try connecting from different network

### Issue: "Database not found"
**Solution**:
- Database is created automatically on first write
- Ensure database name is in connection string

---

## 📚 Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses

---

## ✅ Setup Complete!

Your MongoDB Atlas database is ready for production! 🎉

**Next Steps:**
1. ✅ Save your connection string securely
2. ✅ Add to backend environment variables
3. ✅ Deploy to Cloud Run
4. ✅ Test connection
5. ✅ Monitor performance

**Connection String Format:**
```
mongodb+srv://movie-booking-api:YOUR_PASSWORD@movie-booking-prod.xxxxx.mongodb.net/movie-booking?retryWrites=true&w=majority
```

**Ready to deploy to Cloud Run!** 🚀

