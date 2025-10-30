# 🐛 Debugging Theater Creation Issue

## Changes Made

I've added console.log statements to help debug. Now when you try to create a theater:

### What to Check:

1. **Open Browser Console** (F12 → Console tab)

2. **Try to submit the form**

3. **Look for these messages:**

   **If you see "Form validation errors":**
   - This means required fields are missing
   - Check which fields are showing errors
   - Make sure you fill: Theater Name, Street, City, State, Phone, License Number

   **If you see "Form submitted!" and "Sending theater data":**
   - Form validation passed
   - Request is being sent
   - Check for error response

   **If you see "Theater created successfully":**
   - Theater was created! 
   - Check `/theaters` page
   - Or check MongoDB

   **If you see "Error creating theater":**
   - Check the error message
   - Likely authentication or validation issue

4. **Check Network Tab** (F12 → Network tab)
   - Look for POST request to `/api/theaters`
   - Check the request payload
   - Check the response

## Common Issues:

### Issue 1: Not Logged In
**Symptom:** "Not authorized to access this route"
**Fix:** Make sure you're logged in as Theater Owner or Admin

### Issue 2: Missing Required Fields
**Symptom:** Form validation errors in console
**Fix:** Fill all fields marked with *

### Issue 3: Backend Not Running
**Symptom:** Network error, ERR_CONNECTION_REFUSED
**Fix:** 
```bash
cd backend
npm run dev
```

### Issue 4: Wrong API URL
**Symptom:** 404 or connection errors
**Fix:** Check frontend/.env.local has:
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## Quick Test Steps:

### 1. Verify You're Logged In
```javascript
// In browser console:
localStorage.getItem('token')
localStorage.getItem('user')
```

Should show your token and user data.

### 2. Test Backend Directly
```bash
# Get your token from localStorage
curl -X POST http://localhost:5001/api/theaters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "theaterName": "Test Theater",
    "description": "Test",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra"
    },
    "contact": {
      "phone": "9876543210"
    },
    "licenseNumber": "LIC123"
  }'
```

### 3. Check Backend Logs
Look at the terminal where backend is running for any errors.

## Expected Flow:

1. Fill form → Click "Create Theater"
2. Console shows: "Form submitted!"
3. Console shows: "Sending theater data: {...}"
4. Backend receives request and logs it
5. Theater created in MongoDB
6. Console shows: "Theater created successfully"
7. Redirects to `/theaters` page

## Still Not Working?

Try these:

1. **Hard refresh the page:** Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Clear localStorage and login again**
3. **Restart both frontend and backend**
4. **Check the exact error message in console**
5. **Share the console output with me**

---

**After adding the debug logs, try creating a theater again and check your browser console for the messages!**

