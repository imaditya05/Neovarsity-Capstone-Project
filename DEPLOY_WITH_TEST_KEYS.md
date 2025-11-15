# 🧪 Deploying with Razorpay TEST Keys

**Perfect for initial deployment! No risk, full functionality testing.**

---

## ✅ Why Deploy with TEST Keys First?

✅ **Zero Risk** - No real money involved  
✅ **Full Testing** - Test entire payment flow in production  
✅ **Same Experience** - Everything works identically  
✅ **Easy Switch** - Change to LIVE keys anytime in 30 seconds  
✅ **Unlimited Testing** - Use test cards as many times as you want  
✅ **No KYC Required** - Start immediately  

---

## 🎯 What You Need

### 1. Get Razorpay TEST Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Make sure you're in **TEST MODE** (toggle at top)
3. Go to **Settings** → **API Keys**
4. Copy your **TEST** keys:
   - Key ID: `rzp_test_XXXXXXXXXXXXX`
   - Key Secret: `YYYYYYYYYYYYYYYYYYYY`

---

## 🚀 Deployment Configuration

### Backend Environment Variables:

```bash
NODE_ENV=production
PORT=8080
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-xxx.run.app

# Use TEST keys (not LIVE):
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYY
```

### Frontend Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-xxx.run.app

# Use TEST Key ID (not LIVE):
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
```

---

## 🧪 Testing in Production

### Test Payment Methods:

#### ✅ Credit/Debit Card (Success)
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25 (any future date)
Name: Test User
```

#### ✅ UPI (Success)
```
UPI ID: success@razorpay
```

#### ✅ NetBanking (Success)
```
Select any bank
Username: test
Password: test
```

#### ❌ Failed Payment (for testing errors)
```
Card Number: 4111 1111 1111 1112
CVV: 123
Expiry: 12/25
```

---

## 📊 What Shows in Razorpay Dashboard

When using TEST keys:
- All payments appear in **TEST MODE** dashboard
- Marked with **"TEST"** label
- No actual money is charged
- Can test refunds, webhooks, everything

---

## 🔄 Switching to LIVE Keys Later

When you're ready for real payments (requires Razorpay KYC):

### Option 1: Via gcloud CLI (30 seconds)

```bash
# Update backend
gcloud run services update backend --region us-central1 \
  --update-env-vars \
  RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX,\
  RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET

# Update frontend
gcloud run services update frontend --region us-central1 \
  --update-env-vars \
  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
```

### Option 2: Via Google Cloud Console

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click **backend** service → **Edit & Deploy New Revision**
3. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` variables
4. Deploy
5. Repeat for **frontend** service with `NEXT_PUBLIC_RAZORPAY_KEY_ID`

**Zero downtime! Takes ~30 seconds.** 🚀

---

## ✅ Deployment Checklist (with TEST keys)

### Prerequisites:
- [ ] MongoDB Atlas setup complete
- [ ] Razorpay TEST keys ready
- [ ] Google Cloud project setup
- [ ] `gcloud` CLI configured

### Backend Deployment:
- [ ] Build Docker image
- [ ] Deploy to Cloud Run
- [ ] Set `RAZORPAY_KEY_ID=rzp_test_XXX`
- [ ] Set `RAZORPAY_KEY_SECRET` (test secret)
- [ ] Set other env vars (MONGO_URI, JWT_SECRET, etc.)
- [ ] Test health endpoint

### Frontend Deployment:
- [ ] Build Docker image
- [ ] Deploy to Cloud Run
- [ ] Set `NEXT_PUBLIC_API_URL`
- [ ] Set `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXX`
- [ ] Test frontend loads

### Backend CORS Update:
- [ ] Update `FRONTEND_URL` in backend
- [ ] Redeploy backend

### Testing:
- [ ] Register new user
- [ ] Login
- [ ] Browse movies/shows
- [ ] Book tickets
- [ ] Complete payment with **test card**
- [ ] Verify booking confirmation
- [ ] Check "My Bookings"
- [ ] Verify payment in Razorpay TEST dashboard

---

## 🎯 Expected Behavior

### In Your App:
✅ Payment flow works exactly like production  
✅ Razorpay checkout opens normally  
✅ Users can complete payments  
✅ Bookings are confirmed  
✅ Seats are blocked  

### In Razorpay Dashboard (TEST MODE):
✅ Payments appear with "TEST" label  
✅ All transaction details visible  
✅ Can test refunds  
✅ Can test webhooks  
✅ Can see all payment methods  

### What WON'T Happen:
❌ No real money charged  
❌ No actual bank transactions  
❌ No real SMS/emails from Razorpay (unless configured in test mode)  

---

## 💡 Pro Tips

### 1. Test Different Scenarios
- ✅ Successful payment
- ❌ Failed payment
- 🔄 Payment cancellation
- 💳 Different payment methods (card, UPI, netbanking)

### 2. Test Edge Cases
- Multiple users booking same seats
- Concurrent bookings
- Payment timeout
- Network errors

### 3. Monitor Performance
- Check Cloud Run logs
- Monitor response times
- Check error rates
- Verify database queries

### 4. Prepare for LIVE Switch
- Document the switch process
- Test switch on staging first (if available)
- Plan maintenance window (though zero downtime)
- Notify team/users if needed

---

## 📊 Comparison: TEST vs LIVE

| Feature | TEST Mode | LIVE Mode |
|---------|-----------|-----------|
| **Payment Processing** | Simulated | Real |
| **Money** | No actual charges | Real money |
| **Test Cards** | Work | Don't work |
| **Real Cards** | Don't work | Work |
| **Dashboard** | TEST section | LIVE section |
| **Refunds** | Simulated | Real |
| **KYC Required** | No | Yes |
| **Transaction Fees** | None | 2% + GST |
| **Webhooks** | Work | Work |
| **Integration** | Identical | Identical |

---

## 🔐 Security Note

Even with TEST keys:
- ✅ Store keys in environment variables
- ✅ Use Google Secret Manager (recommended)
- ✅ Never commit keys to Git
- ✅ Rotate keys if exposed
- ✅ Monitor access logs

---

## 🎓 When to Switch to LIVE?

Consider switching when:
- ✅ Tested all features thoroughly
- ✅ Confident in payment flow
- ✅ Tested error scenarios
- ✅ Monitoring is setup
- ✅ Team is trained
- ✅ Ready to accept real money
- ✅ Completed Razorpay KYC
- ✅ Legal/compliance ready

**No rush! Test as long as you need.** 🧪

---

## 🆘 Troubleshooting TEST Mode

### Issue: "Payment not working"
- Verify TEST keys (start with `rzp_test_`)
- Check both backend and frontend keys match
- Use correct test card numbers

### Issue: "Test card declined"
- Use `4111 1111 1111 1111` (always works)
- Use future expiry date
- Use any 3-digit CVV

### Issue: "Payment shows in LIVE dashboard"
- You're using LIVE keys by mistake
- Switch to TEST keys
- Check `rzp_test_` vs `rzp_live_`

---

## 📚 Additional Resources

- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Test Mode](https://razorpay.com/docs/payments/dashboard/test-mode/)
- [Payment Integration Testing](https://razorpay.com/docs/payments/testing/)

---

## ✅ Summary

**Deploying with TEST keys is:**
- ✅ **Recommended** for first deployment
- ✅ **Safe** - no financial risk
- ✅ **Complete** - all features work
- ✅ **Flexible** - switch to LIVE anytime

**Follow the same deployment guides:**
- `DEPLOYMENT_QUICK_START.md`
- `CLOUD_RUN_DEPLOYMENT.md`

**Just use TEST keys instead of LIVE keys!**

---

## 🚀 Ready to Deploy!

**Your deployment will have:**
- ✅ Full payment integration
- ✅ Zero financial risk
- ✅ Complete testing capability
- ✅ Easy switch to LIVE later

**Use the same deployment steps with TEST keys!** 🎉

---

**Good luck with your deployment! 🚀🧪**

