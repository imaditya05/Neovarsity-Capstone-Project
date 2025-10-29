# 🎬 Movie Booking Application

A full-stack movie booking application built with Next.js and Node.js.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
capstone_project/
├── frontend/           # Next.js frontend application
│   ├── app/           # App Router pages and layouts
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
│
└── backend/           # Node.js backend API
    ├── routes/        # API route definitions
    ├── controllers/   # Business logic handlers
    ├── models/        # Data models
    ├── middleware/    # Custom middleware
    ├── config/        # Configuration files
    ├── utils/         # Utility functions
    ├── server.js      # Main server file
    └── package.json   # Backend dependencies
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
PORT=5000
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

5. The API will be available at [http://localhost:5000](http://localhost:5000)

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🔧 Environment Variables

### Backend
Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
NODE_ENV=development
# Add more environment variables as needed
```

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

More endpoints will be added as the project develops.

## 🎯 Features (Planned)

- [ ] User authentication and authorization
- [ ] Browse movies and showtimes
- [ ] Seat selection interface
- [ ] Booking management
- [ ] Payment integration
- [ ] Admin panel for movie management
- [ ] Email notifications
- [ ] Booking history

## 🤝 Contributing

This is a capstone project. Contributions and suggestions are welcome!

## 📄 License

ISC

## 👤 Author

Your Name

---

**Note:** This project is currently in initial setup phase. More features and documentation will be added as development progresses.

