# 🚀 Quick Setup Guide

## Step-by-Step Instructions

### 1️⃣ Install MongoDB

Choose one option:

#### Option A: Local MongoDB
**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud - Recommended for Quick Start)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get your connection string
5. Update `backend/.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie_booking
   ```

### 2️⃣ Start the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Make sure .env file exists with correct values
# File should contain:
# PORT=5000
# NODE_ENV=development
# MONGODB_URI=mongodb://localhost:27017/movie_booking
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# JWT_EXPIRE=7d
# FRONTEND_URL=http://localhost:3000

# Start the development server
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
📍 Environment: development
✅ MongoDB Connected: localhost
📊 Database: movie_booking
```

### 3️⃣ Start the Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Make sure .env.local exists with:
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start the development server
npm run dev
```

You should see:
```
✓ Starting...
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

### 4️⃣ Test the Application

1. Open your browser and go to: http://localhost:3000
2. You should see the Movie Booking homepage
3. Click "Sign Up" to create a new account
4. Try registering as:
   - **Regular User**: Select "Movie Fan (Book Tickets)"
   - **Theater Owner**: Select "Theater Owner (Manage Theater)" and fill in theater details

### 5️⃣ Verify Everything Works

#### Test User Registration & Login
1. Sign up with a new account
2. You should be automatically logged in and redirected to the home page
3. You should see "Welcome, [Your Name]" in the header
4. Your role badge should be displayed

#### Test Authentication
1. Click "Logout"
2. Click "Login"
3. Enter your credentials
4. You should be logged in successfully

#### Test Backend API Directly
```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"success","message":"Movie Booking API is running","timestamp":"..."}
```

## 🐛 Troubleshooting

### Backend won't start
- **Error: "MongooseServerSelectionError"**
  - MongoDB is not running
  - Solution: Start MongoDB or check connection string

- **Error: "Port 5000 already in use"**
  - Another process is using port 5000
  - Solution: Stop the other process or change PORT in .env

### Frontend won't start
- **Error: "Port 3000 already in use"**
  - Solution: Run on different port: `npm run dev -- -p 3001`

- **Error: "Cannot find module"**
  - Solution: Delete `node_modules` and run `npm install` again

### Authentication not working
- Check browser console for errors (F12)
- Make sure backend is running
- Check that NEXT_PUBLIC_API_URL is set correctly in frontend/.env.local
- Clear browser localStorage and try again

### MongoDB connection issues
- **Local MongoDB**: Make sure MongoDB service is running
  ```bash
  # Mac
  brew services list
  brew services start mongodb-community
  
  # Linux
  sudo systemctl status mongod
  sudo systemctl start mongod
  ```

- **MongoDB Atlas**: 
  - Check your IP is whitelisted (use 0.0.0.0/0 for testing)
  - Verify username and password in connection string
  - Check network connectivity

## 📝 Environment Variables Checklist

### Backend (.env)
- [ ] PORT=5000
- [ ] NODE_ENV=development
- [ ] MONGODB_URI (correct connection string)
- [ ] JWT_SECRET (should be a long random string)
- [ ] JWT_EXPIRE=7d
- [ ] FRONTEND_URL=http://localhost:3000

### Frontend (.env.local)
- [ ] NEXT_PUBLIC_API_URL=http://localhost:5000

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Backend console shows "MongoDB Connected"
- ✅ Frontend loads without errors at http://localhost:3000
- ✅ You can register a new user
- ✅ You can login with your credentials
- ✅ Your name appears in the header after login
- ✅ Logout works and redirects to login page

## 🎉 Next Steps

Once everything is working:
1. Try registering as a theater owner
2. Check how the UI changes based on user role
3. Explore the codebase structure
4. Start building the next features:
   - Movie management
   - Theater management
   - Booking system
   - Seat selection

Need help? Check:
- README.md for detailed documentation
- TEST_API.md for API testing commands
- backend/models/User.js to understand the data structure

