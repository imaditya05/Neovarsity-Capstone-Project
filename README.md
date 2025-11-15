# 🎬 Movie Booking Application

A full-stack movie booking platform with role-based authentication, theater management, seat selection, and Razorpay payment integration.

## 🚀 Tech Stack

**Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Authentication:** JWT, bcryptjs  
**Payment:** Razorpay  
**Deployment:** Google Cloud Run, Docker

## ✨ Features

### 🔐 Authentication & Authorization
- Multi-role system: User, Theater Owner, Admin
- JWT-based secure authentication
- Role-based access control
- Protected routes and API endpoints

### 🎭 Theater Management
- Theater owners can create and manage theaters
- Screen and seat layout configuration
- Admin approval workflow (pending → approved/rejected)
- Multi-screen support with custom seat categories

### 🎬 Movie Management
- Add, edit, delete movies
- Rich movie details (cast, crew, genres, ratings)
- Movie search and filtering
- Image uploads and trailers

### 🎟️ Showtime Management
- Create shows with date, time, and format (2D/3D/IMAX)
- Link movies to theaters and screens
- Seat availability tracking
- Dynamic pricing by seat category

### 💺 Booking System
- Interactive seat selection UI
- Real-time seat availability
- Multiple seat categories (Regular, Premium, VIP)
- Booking confirmation with unique booking numbers
- Booking history and cancellation

### 💳 Payment Integration
- Razorpay payment gateway integration
- Secure payment verification
- Payment status tracking
- Refund support for cancellations

### 👨‍💼 Admin Dashboard
- Approve/reject theaters
- Manage all content
- View statistics and analytics
- User management

## 📁 Project Structure

```
capstone_project/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── middleware/      # Auth & validation
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── app/            # Next.js pages
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   └── lib/           # API utilities
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Razorpay account (for payments)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

Create `backend/.env`:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movie_booking
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# Razorpay credentials
RAZORPAY_KEY_ID=rzp_test_XXXXX
RAZORPAY_KEY_SECRET=YYYYY
```

### 3. Configure Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXX
```

### 4. Start Servers

**Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5001
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

## 👥 User Roles & Workflows

### Regular User
1. Browse movies and theaters
2. Select showtime
3. Choose seats on interactive seat map
4. Complete payment via Razorpay
5. Receive booking confirmation
6. View booking history

### Theater Owner
1. Create and manage theaters
2. Add screens with seat layouts
3. Add movies
4. Create showtimes
5. View bookings for their theaters
6. Wait for admin approval on new theaters

### Admin
1. Approve/reject theaters
2. Manage all movies and theaters
3. View system statistics
4. Full access to all features

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register user
POST   /api/auth/login          - Login
GET    /api/auth/me             - Get current user
PUT    /api/auth/profile        - Update profile
```

### Movies
```
GET    /api/movies              - List all movies
GET    /api/movies/:id          - Movie details
POST   /api/movies              - Create movie (Theater Owner/Admin)
PUT    /api/movies/:id          - Update movie
DELETE /api/movies/:id          - Delete movie
```

### Theaters
```
GET    /api/theaters            - List theaters
GET    /api/theaters/:id        - Theater details
POST   /api/theaters            - Create theater
PUT    /api/theaters/:id/status - Approve/reject (Admin)
```

### Shows
```
GET    /api/shows               - List shows
GET    /api/shows/:id           - Show details
GET    /api/shows/:id/seats     - Seat availability
POST   /api/shows               - Create show
```

### Bookings
```
POST   /api/bookings            - Create booking
GET    /api/bookings/my-bookings - User's bookings
PUT    /api/bookings/:id/cancel  - Cancel booking
```

### Payments
```
GET    /api/payments/key         - Get Razorpay key
POST   /api/payments/create-order - Create payment order
POST   /api/payments/verify      - Verify payment signature
```

## 💳 Payment Setup

### Razorpay Test Mode

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get test API keys from dashboard
3. Add to `.env` files (backend and frontend)
4. Use test cards for testing:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date

### Payment Flow
1. User selects seats → Creates booking (pending)
2. Razorpay order created
3. Checkout modal opens
4. User completes payment
5. Backend verifies payment signature
6. Booking updated (completed)
7. Seats marked as booked

## 🚢 Deployment (Google Cloud Run)

### Backend Deployment
```bash
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/backend:latest .
docker push gcr.io/YOUR_PROJECT_ID/backend:latest
gcloud run deploy backend \
  --image gcr.io/YOUR_PROJECT_ID/backend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080
```

### Frontend Deployment
```bash
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://backend-xxx.run.app \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx \
  -t gcr.io/YOUR_PROJECT_ID/frontend:latest .
docker push gcr.io/YOUR_PROJECT_ID/frontend:latest
gcloud run deploy frontend \
  --image gcr.io/YOUR_PROJECT_ID/frontend:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

**Important:** Set environment variables in Cloud Run console for sensitive data.

## 🧪 Testing

### Test as Theater Owner
1. Register as theater owner
2. Create a theater (status: pending)
3. Admin approves theater
4. Add a movie
5. Create showtime for the movie
6. Theater is now bookable

### Test as User
1. Browse shows
2. Select a show
3. Choose seats on seat map
4. Complete payment (use test card)
5. View booking confirmation
6. Check "My Bookings"

### Test Cancellation
1. Go to "My Bookings"
2. Cancel a future booking
3. Refund calculated based on timing
4. Seats released for rebooking

## 🎯 Key Features in Detail

### Seat Selection System
- Visual seat map with rows and columns
- Color coding: Blue (available), Green (selected), Gray (booked)
- Real-time seat availability
- Maximum 10 seats per booking
- Category-based pricing

### Booking Workflow
- Status flow: pending → completed/cancelled
- Unique booking numbers (BK-YYYYMMDD-XXXX)
- Refund policy:
  - 3+ days before: 100% refund
  - < 2 hours: No cancellation allowed

### Theater Approval System
- New theaters start as "pending"
- Admin reviews and approves/rejects
- Only approved theaters visible to public
- Theater owners see their own theaters regardless of status

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Protected API routes
- Payment signature verification
- Input validation and sanitization
- CORS configuration

## 📊 Database Models

**User:** name, email, password, role, phone, theaterDetails  
**Movie:** title, genre, language, duration, cast, crew, rating, status  
**Theater:** name, address, screens, facilities, status, owner  
**Show:** movie, theater, screen, date, time, seatLayout, pricing  
**Booking:** user, show, seats, amount, paymentStatus, razorpayDetails

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- Modern gradient backgrounds
- Interactive components
- Loading states and skeletons
- Error handling with user feedback
- Toast notifications
- Dark mode support

## 📝 Environment Variables

### Backend Required
- `PORT` - Server port
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Token signing key
- `RAZORPAY_KEY_ID` - Payment gateway key
- `RAZORPAY_KEY_SECRET` - Payment gateway secret

### Frontend Required
- `NEXT_PUBLIC_API_URL` - Backend URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Public payment key

## 🎓 Admin Credentials (Default)

**Email:** admin@moviebooking.com  
**Password:** admin123

⚠️ **Change these immediately in production!**

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Google Cloud Run](https://cloud.google.com/run/docs)

## 🎉 Features Summary

✅ Complete authentication system  
✅ Multi-role authorization  
✅ Theater and screen management  
✅ Movie catalog with search  
✅ Showtime scheduling  
✅ Interactive seat selection  
✅ Payment gateway integration  
✅ Booking management  
✅ Admin dashboard  
✅ Responsive UI  
✅ Production-ready deployment

## 📄 License

ISC

---

**Built with ❤️ as a capstone project**
