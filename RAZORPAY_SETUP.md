# 🎉 Razorpay Payment Gateway Integration - Setup Guide

## 📋 Overview
Your movie booking platform now has a complete Razorpay payment integration! This guide will help you set it up.

---

## 🔑 Step 1: Get Razorpay API Keys

### 1.1 Create Razorpay Account
1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Sign up for a free account
3. Complete the KYC verification (for live mode)

### 1.2 Get Test/Live Keys
1. Login to Razorpay Dashboard: [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Generate keys:
   - **Test Mode**: Use test keys for development (no real money)
   - **Live Mode**: Use live keys for production (real transactions)

You'll get:
- `Key ID` (starts with `rzp_test_` or `rzp_live_`)
- `Key Secret` (keep this secure!)

---

## ⚙️ Step 2: Configure Backend

### 2.1 Update `.env` file in `backend/` folder:

```bash
# Existing variables
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Add these Razorpay variables
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYY
```

⚠️ **Important**: 
- Never commit `.env` file to Git
- Use **test keys** for development
- Use **live keys** only in production

---

## 🧪 Step 3: Test the Integration

### 3.1 Start Your Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 3.2 Test Payment Flow

1. **Login** to your application
2. **Browse shows** and click "Book Now"
3. **Select seats** on the seat selection page
4. **Click "Proceed to Pay"** button
5. **Razorpay checkout** will open
6. Use **test card details**:

#### Razorpay Test Cards:

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

**UPI:**
- VPA: `success@razorpay`

**Netbanking:**
- Select any bank → Username: `test`, Password: `test`

**Failure (for testing):**
- Card: `4111 1111 1111 1112`

### 3.3 What Happens:
1. ✅ Booking created with `pending` payment status
2. ✅ Razorpay checkout opens with amount
3. ✅ After successful payment → payment verified
4. ✅ Booking updated with payment details
5. ✅ Redirected to confirmation page
6. ✅ Seats marked as booked in database

---

## 🔍 Step 4: Verify Integration

### 4.1 Check Backend Logs
You should see:
```
Creating booking...
Booking created: 674xxxxx
Creating payment order...
Payment order created: order_xxxxx
Payment successful, verifying...
Payment verified, updating booking...
Booking payment updated successfully
```

### 4.2 Check Database
In MongoDB, verify the booking has:
- `paymentStatus: 'completed'`
- `razorpay_order_id: 'order_xxxxx'`
- `razorpay_payment_id: 'pay_xxxxx'`
- `razorpay_signature: '...'`
- `paymentMethod: 'card'` (or 'upi', 'netbanking')
- `paymentDate: '2024-xx-xx...'`

### 4.3 Check Razorpay Dashboard
1. Go to [Dashboard → Payments](https://dashboard.razorpay.com/app/payments)
2. You should see test payments listed
3. Click on a payment to see details

---

## 📊 Payment Flow Architecture

```
┌─────────────┐
│   User      │
│ Selects     │
│   Seats     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  1. Create Booking (Pending)    │
│     POST /api/bookings          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  2. Create Razorpay Order       │
│     POST /api/payments/create-  │
│          order                  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  3. Open Razorpay Checkout      │
│     (Frontend SDK)              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  4. User Completes Payment      │
│     (Razorpay Gateway)          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  5. Verify Payment Signature    │
│     POST /api/payments/verify   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  6. Update Booking Payment      │
│     PUT /api/bookings/:id/      │
│         payment                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  7. Redirect to Confirmation    │
│     /booking/confirm/:id        │
└─────────────────────────────────┘
```

---

## 🎨 Features Implemented

### ✅ Backend (Node.js/Express)
- Payment order creation
- Payment verification with signature
- Razorpay SDK integration
- Secure API endpoints
- Payment details in booking model
- Refund capability (for cancellations)

### ✅ Frontend (Next.js/React)
- Razorpay Checkout integration
- Automatic payment flow
- Payment status display
- Error handling
- Loading states
- Success/failure callbacks

### ✅ Security
- Server-side payment verification
- Signature validation
- Protected API routes
- Environment variables for keys

---

## 🚀 Going Live (Production)

When you're ready to accept real payments:

### 1. Complete KYC on Razorpay
- Submit business documents
- Bank account verification
- Wait for approval

### 2. Update to Live Keys
```bash
# In production .env
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYY
```

### 3. Setup Webhooks (Optional but Recommended)
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.processed`
4. Save webhook secret in `.env`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 4. Test in Live Mode
- Make a real ₹1 transaction
- Verify everything works
- Then go live!

---

## 🛠️ Troubleshooting

### Issue: "Failed to load Razorpay SDK"
**Solution**: Check internet connection, Razorpay script loads from CDN

### Issue: "Payment verification failed"
**Solution**: 
- Check if `RAZORPAY_KEY_SECRET` is correct in `.env`
- Ensure backend is running
- Check browser console for errors

### Issue: "Booking created but payment not updated"
**Solution**: 
- Check backend logs for errors
- Verify payment was successful in Razorpay dashboard
- Check database for booking payment status

### Issue: "Seats not getting blocked"
**Solution**: 
- Payment must be completed to block seats
- Check if booking controller is updating show's booked seats
- Verify show model's `bookSeats` method

---

## 📝 Test Scenarios

### ✅ Success Flow
1. Select seats → Pay → Success → Confirmation

### ❌ Payment Cancelled
1. Select seats → Pay → Click "Cancel" → Seats released

### ❌ Payment Failed
1. Select seats → Pay → Use fail card → Error message → Seats released

### 🔄 Multiple Users
1. User A selects seat A1
2. User B tries to select A1 → Should see as unavailable
3. If A pays → A1 blocked
4. If A cancels → A1 available again

---

## 🎯 Next Steps (Optional)

1. **Email Notifications**
   - Send booking confirmation email
   - Send payment receipt

2. **SMS Notifications**
   - Booking confirmation SMS
   - Show reminder SMS

3. **QR Code Tickets**
   - Generate QR codes for bookings
   - Theater can scan at entry

4. **Analytics Dashboard**
   - Revenue reports
   - Booking trends
   - Popular movies/theaters

5. **Refund Automation**
   - Automatic refunds on cancellation
   - Partial refunds based on timing

---

## 📚 Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Node.js SDK](https://razorpay.com/docs/payments/server-integration/nodejs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)

---

## ✅ Integration Complete!

Your movie booking platform now accepts **real payments** through Razorpay! 🎉

**What's working:**
- ✅ Secure payment processing
- ✅ Payment verification
- ✅ Seat booking with payment
- ✅ Payment status tracking
- ✅ Booking confirmations
- ✅ Refund capability

**Happy booking! 🍿🎬**

