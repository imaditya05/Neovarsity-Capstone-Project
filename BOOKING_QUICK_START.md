# 🚀 Quick Start Guide - Booking System

## ⚡ Setup Instructions

### 1. **Restart Backend Server** (IMPORTANT!)
```bash
cd backend
# Press Ctrl+C to stop current server
npm run dev
```

The backend needs to restart to register the new booking routes!

---

## 🎯 Testing the Booking Flow

### Step 1: Browse Shows
1. Go to **`http://localhost:3000/shows`**
2. You'll see all available shows with:
   - Movie poster and details
   - Theater and screen info
   - Available seats count
   - **"Book Now" button**

### Step 2: Select Seats
1. Click **"Book Now"** on any show
2. You'll be redirected to **`/booking/[showId]`**
3. You'll see:
   - 🎬 **Screen at the top**
   - 🎨 **Color-coded seat map**:
     - **Blue** = Available
     - **Green** = Your selection
     - **Gray** = Already booked
   - 💰 **Live price calculation**
   - 🎫 **Booking summary**

### Step 3: Select Your Seats
1. **Click seats** to select/deselect
2. Maximum **10 seats** per booking
3. Watch the **price update** in real-time
4. See **selected seats** list on the right

### Step 4: Book Tickets
1. Click **"Book X Seats"** button
2. Booking is created **instantly**
3. Redirected to **confirmation page**

### Step 5: View Confirmation
1. See your **Booking Number** (format: BK-20231112-ABC123)
2. View complete details:
   - Movie and show information
   - Your seats
   - Payment summary
   - Contact details
3. **Email confirmation** sent (in production)

### Step 6: Manage Your Bookings
1. Navigate to **"My Bookings"** (in header navigation)
2. See all your bookings with status
3. **View details** or **Cancel booking** (if eligible)

---

## 🎨 What You'll See

### Seat Selection Page:
```
┌─────────────────────────────────────────┐
│         [==== SCREEN ====]              │
│                                         │
│  Legend: 🟦 Available 🟩 Selected      │
│         🔲 Booked                      │
│                                         │
│  A  [1][2][3][4][5][6][7][8]...        │
│  B  [1][2][3][4][5][6][7][8]...        │
│  C  [1][2][3][4][5][6][7][8]...        │
│  ...                                    │
│                                         │
│  Seat Categories:                       │
│  Regular: ₹150  Premium: ₹250          │
│  VIP: ₹350                             │
└─────────────────────────────────────────┘

  Right Sidebar:
  ┌──────────────────┐
  │  Movie Poster    │
  │  Movie Title     │
  │  Theater Info    │
  │  Date & Time     │
  │                  │
  │  Selected Seats: │
  │  A1, A2, A3      │
  │                  │
  │  Subtotal: ₹450  │
  │  Conv Fee: ₹60   │
  │  Total:   ₹510   │
  │                  │
  │  [Book 3 Seats]  │
  └──────────────────┘
```

---

## 🧪 Test Scenarios

### Test 1: Basic Booking
- ✅ Login as any user
- ✅ Go to `/shows`
- ✅ Click "Book Now" on a show
- ✅ Select 3 seats
- ✅ Click "Book 3 Seats"
- ✅ See confirmation page
- ✅ Check "My Bookings"

### Test 2: Seat Availability
- ✅ Create booking for specific seats
- ✅ Try booking same seats again
- ✅ Should show "already booked" error
- ✅ Seats should be gray in seat map

### Test 3: Booking Cancellation
- ✅ Go to "My Bookings"
- ✅ Find a future booking
- ✅ Click "Cancel Booking"
- ✅ Confirm cancellation
- ✅ See refund amount
- ✅ Booking status changes to "Cancelled"
- ✅ Seats released (try booking them again)

### Test 4: Refund Policy
**Scenario A: Cancel 3+ days before show**
- Result: **100% refund** ✅

**Scenario B: Cancel 1-2 hours before show**
- Result: **No cancellation allowed** ❌

### Test 5: Multiple Users
- ✅ User A books seats A1, A2
- ✅ User B tries to book A1
- ✅ Should fail with "already booked"
- ✅ User B books A3, A4 successfully

---

## 🎯 Available Routes

### User Routes:
```
/shows              → Browse all shows
/shows/add          → Add new show (Theater Owner/Admin)
/booking/[showId]   → Select seats & book
/booking/confirm/[bookingId] → Confirmation page
/bookings           → My bookings history
```

### API Endpoints:
```
POST   /api/bookings              → Create booking
GET    /api/bookings/my-bookings  → Get user's bookings
GET    /api/bookings/:id          → Get booking details
PUT    /api/bookings/:id/cancel   → Cancel booking
GET    /api/bookings/admin/all    → All bookings (Admin)
GET    /api/bookings/admin/stats  → Statistics (Admin)
```

---

## 🔍 What's Implemented

### ✅ Backend:
- [x] Booking model with validation
- [x] Create booking with seat validation
- [x] Real-time seat availability check
- [x] Automatic booking number generation
- [x] Cancel booking with refund calculation
- [x] Seat release on cancellation
- [x] User booking history
- [x] Admin statistics

### ✅ Frontend:
- [x] Interactive seat selection UI
- [x] Color-coded seat map
- [x] Real-time price calculation
- [x] Booking confirmation page
- [x] My Bookings page with history
- [x] Cancel booking functionality
- [x] Responsive design (mobile-friendly)
- [x] Loading states & error handling

---

## 🎉 Key Features Working

### 1. **Real-time Seat Selection**
- Click to select/deselect seats
- Visual feedback (color changes)
- Can't select booked seats
- Maximum 10 seats per booking

### 2. **Smart Pricing**
- Category-based pricing
- Convenience fee per seat
- Live total calculation

### 3. **Booking Management**
- View all bookings
- Filter by status
- Cancel with refund policy
- Clear refund messaging

### 4. **Validation**
- Can't book past shows
- Can't double-book seats
- Can't cancel within 2 hours
- User must be authenticated

---

## 💡 Tips for Testing

1. **Create test shows** with different dates/times
2. **Login with different users** to test concurrent bookings
3. **Try edge cases**:
   - Select max 10 seats
   - Try booking same seats twice
   - Cancel and rebook
4. **Check MongoDB** to see booking records
5. **Test on mobile** - UI is responsive!

---

## 🚨 Common Issues

### Issue: "Route not found" when booking
**Solution:** Restart backend server (booking routes need to load)

### Issue: Seats not showing as booked
**Solution:** Refresh the page, check backend console for errors

### Issue: Can't cancel booking
**Solution:** Check show time - must be 2+ hours away

---

## 📊 Check Your Database

After creating bookings, check MongoDB:

```javascript
// In MongoDB Compass or Shell:
db.bookings.find().pretty()
db.shows.find({ "bookedSeats": { $exists: true, $ne: [] } }).pretty()
```

You should see:
- Bookings with seat details
- Shows with bookedSeats array populated

---

## 🎊 Success Indicators

When everything works, you should see:

✅ **"Book Now" buttons** on shows page  
✅ **Interactive seat map** with colors  
✅ **Live price updates** as you select seats  
✅ **Booking number** on confirmation  
✅ **"My Bookings" page** with your bookings  
✅ **Cancel button** (if eligible)  
✅ **Seats released** after cancellation  

---

## 🚀 Ready to Test!

1. **Restart backend** ← CRITICAL STEP!
2. **Go to** `http://localhost:3000/shows`
3. **Click "Book Now"** on any show
4. **Select seats and book**
5. **Enjoy your functional booking system!** 🎬🎟️

**The seat selection and booking system is complete and ready for testing!** 🎉

