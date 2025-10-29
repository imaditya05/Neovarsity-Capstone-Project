# API Testing Guide

## Quick Test Commands

Use these curl commands or import into Postman/Thunder Client to test the API.

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "success",
  "message": "Movie Booking API is running",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### 2. Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "role": "user",
    "phone": "9876543210"
  }'
```

### 3. Register Theater Owner
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Theater Owner",
    "email": "owner@example.com",
    "password": "password123",
    "role": "theater_owner",
    "phone": "9876543210",
    "theaterDetails": {
      "theaterName": "PVR Cinemas",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "licenseNumber": "LIC123456"
    }
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

Save the token from the response!

### 5. Get Profile (Protected Route)
```bash
# Replace YOUR_TOKEN with the actual token from login response
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Update Profile (Protected Route)
```bash
# Replace YOUR_TOKEN with the actual token from login response
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "1234567890"
  }'
```

## Testing Workflow

1. Start MongoDB (if local):
   ```bash
   # Mac: brew services start mongodb-community
   # Windows: net start MongoDB
   # Linux: sudo systemctl start mongod
   ```

2. Start Backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Start Frontend (in new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

4. Test via Web UI:
   - Open http://localhost:3000
   - Click "Sign Up"
   - Create an account (try both user and theater owner)
   - Login with your credentials
   - Check the home page shows your profile

5. Test via API (use curl commands above)

