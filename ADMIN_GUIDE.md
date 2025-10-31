# 🔐 Admin Dashboard Guide

## Admin Credentials

**Email:** `admin@moviebooking.com`  
**Password:** `admin123`

🔐 **Important:** Change this password after first login for security!

---

## Accessing the Admin Dashboard

1. **Login:** http://localhost:3000/login
2. After login, you'll be automatically redirected to: http://localhost:3000/admin/theaters
3. Alternatively, click "Manage Theaters" from the homepage when logged in as admin

---

## Theater Management

### View Pending Theaters
- Navigate to `/admin/theaters`
- Default view shows **Pending** theaters awaiting approval
- Use filter tabs: **Pending** | **Approved** | **Rejected** | **All**

### Approve a Theater
1. Review theater details (name, location, license, screens, facilities)
2. Click **"Approve"** button
3. Theater becomes immediately visible to all users on the frontend

### Reject a Theater
1. Click **"Reject"** button on a pending theater
2. Theater status changes to "rejected"
3. Theater owner can see it but regular users cannot

### View Theater Details
- Click **"View Details"** to see complete theater information
- Check screens, facilities, contact info, etc.

---

## Theater Approval Workflow

```
Theater Owner Creates Theater
          ↓
    Status: PENDING
          ↓
Admin Reviews in Dashboard
          ↓
    ┌─────────┴─────────┐
    ↓                   ↓
APPROVE             REJECT
    ↓                   ↓
Visible to        Hidden from
All Users         Public View
```

---

## Useful Commands

### List All Theaters in Database
```bash
cd backend
node scripts/listTheaters.js
```

This shows:
- Total theater count
- Status breakdown (pending/approved/rejected)
- Detailed info for each pending theater

### Create Additional Admin Users
```bash
cd backend
node scripts/createAdminUser.js
```

---

## Features

### For Admins
- ✅ View all theaters regardless of status
- ✅ Approve/reject theater registrations
- ✅ Manage movies (add/edit/delete)
- ✅ View all user activities
- ✅ Access detailed theater statistics

### For Theater Owners
- ✅ Create new theaters
- ✅ Add screens to their theaters
- ✅ View their own theaters (pending/approved)
- ✅ Edit theater details
- ⏳ Awaits admin approval before public visibility

### For Regular Users
- ✅ Browse approved theaters
- ✅ View theater details
- ✅ Filter by city
- ✅ Search theaters
- 🎬 Book movie tickets (coming soon)

---

## Navigation Shortcuts

- **Home:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin/theaters
- **Movies:** http://localhost:3000/movies
- **Theaters:** http://localhost:3000/theaters
- **Add Theater:** http://localhost:3000/theaters/add
- **Add Movie:** http://localhost:3000/movies/add

---

## Troubleshooting

### Can't see theaters in admin dashboard?
- ✅ Make sure backend server is running (`npm start` in backend folder)
- ✅ Make sure you're logged in as admin
- ✅ Check browser console for errors
- ✅ Verify MongoDB connection is active

### Theaters not showing on public page?
- ✅ Theaters must be **approved** by admin first
- ✅ Check theater status in admin dashboard
- ✅ Approve pending theaters

### Lost admin password?
- ✅ Run `node scripts/createAdminUser.js` to check if admin exists
- ✅ Or manually reset in MongoDB Compass

---

## Security Notes

1. **Change default admin password** immediately in production
2. Admin accounts have full access - protect credentials
3. Review theater licenses and details before approval
4. Monitor rejected theaters for fraudulent attempts

---

## What Was Fixed (Tech Notes)

1. **Admin Redirect Issue:** Changed redirect from `/admin/dashboard` to `/admin/theaters` in AuthContext
2. **Authentication on Public Routes:** Added `optionalAuth` middleware to parse tokens on GET routes
3. **Theater Status Filter:** Backend now correctly identifies admin users and shows all statuses
4. **Admin Approval Endpoints:** Fixed API calls to use correct `/status` endpoint format

All changes maintain backward compatibility with public browsing while enabling admin features.

