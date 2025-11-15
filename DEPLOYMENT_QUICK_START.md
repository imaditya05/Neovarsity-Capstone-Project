# 🚀 Quick Start Deployment Guide

**Fast track to deploying your Movie Booking Platform to Google Cloud Run!**

---

## ⚡ Prerequisites (5 minutes)

- [ ] Google Cloud account with billing enabled
- [ ] `gcloud` CLI installed
- [ ] MongoDB Atlas account (free tier)
- [ ] Razorpay LIVE API keys

---

## 🎯 Deployment Steps (30-45 minutes)

### 1️⃣ Setup MongoDB Atlas (10 min)

```bash
# Follow: MONGODB_ATLAS_SETUP.md

1. Create cluster on MongoDB Atlas
2. Create database user
3. Whitelist IP: 0.0.0.0/0
4. Get connection string:
   mongodb+srv://user:pass@cluster.mongodb.net/movie-booking
```

### 2️⃣ Setup Google Cloud (5 min)

```bash
# Login
gcloud auth login

# Create/set project
gcloud projects create movie-booking-app
gcloud config set project movie-booking-app

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Set region
gcloud config set run/region us-central1
```

### 3️⃣ Deploy Backend (10 min)

```bash
cd backend

# Build & deploy
gcloud builds submit --tag gcr.io/movie-booking-app/backend
gcloud run deploy backend \
  --image gcr.io/movie-booking-app/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi

# Set environment variables
gcloud run services update backend --region us-central1 \
  --update-env-vars \
NODE_ENV=production,\
MONGO_URI="your-mongodb-connection-string",\
JWT_SECRET="your-secret-min-32-chars",\
RAZORPAY_KEY_ID="rzp_live_xxx",\
RAZORPAY_KEY_SECRET="your-secret"

# Get backend URL
BACKEND_URL=$(gcloud run services describe backend --region us-central1 --format 'value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

### 4️⃣ Deploy Frontend (10 min)

```bash
cd ../frontend

# Build & deploy
gcloud builds submit --tag gcr.io/movie-booking-app/frontend
gcloud run deploy frontend \
  --image gcr.io/movie-booking-app/frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi

# Set environment variables
gcloud run services update frontend --region us-central1 \
  --update-env-vars \
NEXT_PUBLIC_API_URL="$BACKEND_URL",\
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxx"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe frontend --region us-central1 --format 'value(status.url)')
echo "Frontend URL: $FRONTEND_URL"
```

### 5️⃣ Update Backend CORS (2 min)

```bash
# Add frontend URL to backend
gcloud run services update backend --region us-central1 \
  --update-env-vars FRONTEND_URL="$FRONTEND_URL"
```

### 6️⃣ Test Your App (3 min)

```bash
# Test backend
curl $BACKEND_URL/api/health

# Open frontend in browser
echo "Open: $FRONTEND_URL"
```

---

## ✅ Success Checklist

- [ ] Backend health check returns success
- [ ] Frontend loads in browser
- [ ] Can register new user
- [ ] Can login
- [ ] Can view movies
- [ ] Theater owner can add movie
- [ ] Theater owner can create show
- [ ] User can book tickets
- [ ] Payment works with Razorpay
- [ ] Booking confirmation shows

---

## 🎯 Your Deployed App

**Frontend**: `https://frontend-xxx.run.app`  
**Backend**: `https://backend-xxx.run.app`

---

## 📊 Files Created for Deployment

✅ `backend/Dockerfile` - Backend container  
✅ `backend/.dockerignore` - Exclude files  
✅ `backend/env.production.template` - Env vars template  
✅ `backend/server.js` - UPDATED with CORS config  

✅ `frontend/Dockerfile` - Frontend container  
✅ `frontend/.dockerignore` - Exclude files  
✅ `frontend/env.production.template` - Env vars template  
✅ `frontend/next.config.ts` - UPDATED with standalone mode  

✅ `CLOUD_RUN_DEPLOYMENT.md` - Full deployment guide  
✅ `MONGODB_ATLAS_SETUP.md` - MongoDB setup guide  
✅ `DEPLOYMENT_QUICK_START.md` - This file  

---

## 🔧 Common Commands

```bash
# Redeploy backend
cd backend && gcloud builds submit --tag gcr.io/movie-booking-app/backend && \
gcloud run deploy backend --image gcr.io/movie-booking-app/backend --region us-central1

# Redeploy frontend
cd frontend && gcloud builds submit --tag gcr.io/movie-booking-app/frontend && \
gcloud run deploy frontend --image gcr.io/movie-booking-app/frontend --region us-central1

# View logs
gcloud run services logs tail backend --region us-central1
gcloud run services logs tail frontend --region us-central1

# List services
gcloud run services list

# Update env var
gcloud run services update SERVICE_NAME --region us-central1 --update-env-vars KEY=VALUE
```

---

## 🐛 Quick Troubleshooting

**Backend won't start:**
```bash
gcloud run services logs read backend --region us-central1 --limit 100
```

**CORS errors:**
```bash
# Verify FRONTEND_URL is set
gcloud run services describe backend --region us-central1
```

**Database connection failed:**
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string format
- Test connection string locally first

---

## 💰 Estimated Costs

- **Cloud Run**: ~$0-5/month (with free tier)
- **MongoDB Atlas**: Free (512MB tier)
- **Total**: ~$0-5/month for low traffic

---

## 📚 Need More Details?

- **Full Guide**: See `CLOUD_RUN_DEPLOYMENT.md`
- **MongoDB Setup**: See `MONGODB_ATLAS_SETUP.md`
- **Razorpay Setup**: See `RAZORPAY_SETUP.md`

---

## 🎉 Congratulations!

Your **Movie Booking Platform** is now **LIVE**! 🚀

**Share your app:**
- Send frontend URL to friends
- Test with real bookings
- Monitor performance

**Next steps:**
- Setup custom domain
- Add monitoring alerts
- Enable CI/CD
- Scale as needed

**Happy booking! 🎬🍿**

