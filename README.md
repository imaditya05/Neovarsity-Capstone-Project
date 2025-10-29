# 🎬 Movie Booking Application

A full-stack movie booking application with role-based authentication built with Next.js and Node.js.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## 👥 User Roles

The application supports three levels of access:

1. **User** - Book movie tickets, view bookings
2. **Theater Owner** - Manage theaters, add movies and showtimes
3. **Admin** - Super admin access to manage everything

## 📁 Project Structure

```
capstone_project/
├── frontend/              # Next.js frontend application
│   ├── app/              # App Router pages
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/             # Utilities and API clients
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── package.json
│
└── backend/              # Node.js backend API
    ├── config/           # Configuration files
    │   └── database.js   # MongoDB connection
    ├── controllers/      # Request handlers
    │   └── authController.js
    ├── models/           # Database models
    │   └── User.js
    ├── middleware/       # Custom middleware
    │   └── auth.js
    ├── routes/           # API routes
    │   └── authRoutes.js
    ├── utils/            # Utility functions
    │   └── generateToken.js
    ├── server.js         # Main server file
    └── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### 1. Clone the Repository

```bash
cd capstone_project
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already created, update if needed)
# Add your MongoDB connection string and JWT secret
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movie_booking
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# Start MongoDB (if using local)
# For Mac: brew services start mongodb-community
# For Windows: net start MongoDB
# For Linux: sudo systemctl start mongod

# Run the backend server
npm run dev
```

The backend will be available at [http://localhost:5000](http://localhost:5000)

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# The .env.local file is already created
# Update if needed:
NEXT_PUBLIC_API_URL=http://localhost:5000

# Run the frontend server
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

## 📝 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |

### Request Examples

#### Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "phone": "1234567890"
}
```

#### Register Theater Owner
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Theater Owner",
  "email": "owner@example.com",
  "password": "password123",
  "role": "theater_owner",
  "phone": "1234567890",
  "theaterDetails": {
    "theaterName": "Cinema Palace",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "licenseNumber": "LIC123456"
  }
}
```

#### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🎨 Frontend Features

### Authentication Pages
- **Login Page** (`/login`) - User authentication with email and password
- **Signup Page** (`/signup`) - User registration with role selection
  - Regular user signup
  - Theater owner signup with theater details
- **Home Page** (`/`) - Landing page with features overview

### Components
- Built with **shadcn/ui** for consistent, beautiful UI
- Responsive design for all screen sizes
- Dark mode support

## 🔐 Authentication Flow

1. User registers with role (user/theater_owner)
2. Backend hashes password and stores user in MongoDB
3. JWT token is generated and returned
4. Frontend stores token in localStorage
5. Token is included in Authorization header for protected routes
6. Middleware validates token on protected endpoints

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user | theater_owner | admin),
  phone: String,
  isActive: Boolean,
  theaterDetails: {
    theaterName: String,
    address: String,
    city: String,
    state: String,
    licenseNumber: String
  },
  timestamps: true
}
```

## 🧪 Testing the Application

### Using the Web Interface

1. Start both backend and frontend servers
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. Click "Sign Up" and create an account
4. Choose account type (User or Theater Owner)
5. Login with your credentials

### Using API Tools (Postman/Thunder Client)

Test the API endpoints directly:
```bash
# Health check
GET http://localhost:5000/api/health

# Register
POST http://localhost:5000/api/auth/register

# Login
POST http://localhost:5000/api/auth/login

# Get profile (requires token)
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🚀 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/movie_booking
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📦 MongoDB Setup Options

### Option 1: Local MongoDB
```bash
# Install MongoDB locally and start the service
# Connection string: mongodb://localhost:27017/movie_booking
```

### Option 2: MongoDB Atlas (Cloud)
```bash
# Create a free cluster at https://www.mongodb.com/cloud/atlas
# Get your connection string and update MONGODB_URI in .env
# Example: mongodb+srv://username:password@cluster.mongodb.net/movie_booking
```

## 🎯 Next Steps

Now that authentication is complete, here are the next features to implement:

- [ ] Movie management (CRUD operations)
- [ ] Theater management
- [ ] Showtime scheduling
- [ ] Seat selection system
- [ ] Booking management
- [ ] Payment integration
- [ ] User dashboard
- [ ] Admin panel
- [ ] Email notifications
- [ ] Search and filters

## 🤝 Contributing

This is a capstone project. Contributions and suggestions are welcome!

## 📄 License

ISC

---

**Note:** Make sure MongoDB is running before starting the backend server. The application requires a database connection to function properly.
