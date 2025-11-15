# 🚀 Google Cloud Run Deployment Guide

Complete guide to deploy your Movie Booking Platform to Google Cloud Run.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ **Google Cloud Account** with billing enabled
2. ✅ **gcloud CLI** installed: [Install gcloud](https://cloud.google.com/sdk/docs/install)
3. ✅ **Docker** installed (for local testing): [Install Docker](https://docs.docker.com/get-docker/)
4. ✅ **MongoDB Atlas** account (for production database)
5. ✅ **Razorpay** account with LIVE API keys
6. ✅ Your application code ready with all features working locally

---

## 🗂️ Project Structure

Your project now has Docker support:

```
capstone_project/
├── backend/
│   ├── Dockerfile              ✅ NEW
│   ├── .dockerignore           ✅ NEW
│   ├── env.production.template ✅ NEW
│   └── ... (your backend code)
├── frontend/
│   ├── Dockerfile              ✅ NEW
│   ├── .dockerignore           ✅ NEW
│   ├── env.production.template ✅ NEW
│   ├── next.config.ts          ✅ UPDATED (standalone mode)
│   └── ... (your frontend code)
└── CLOUD_RUN_DEPLOYMENT.md     ✅ This file
```

---

## 🎯 Deployment Overview

We'll deploy in this order:
1. **MongoDB Atlas** - Database (must be first)
2. **Backend API** - Express server on Cloud Run
3. **Frontend** - Next.js app on Cloud Run
4. **Configure** - Environment variables and CORS

---

## 📊 Part 1: Setup MongoDB Atlas

### Step 1.1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click **"Create"** → **"Shared Cluster"** (Free tier)
4. Choose:
   - **Cloud Provider**: Google Cloud
   - **Region**: Choose closest to your Cloud Run region (e.g., `us-central1`)
   - **Cluster Name**: `movie-booking-prod`
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 1.2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `movie-booking-api`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 1.3: Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is required for Cloud Run (serverless IPs change)
   - Security: Use MongoDB Atlas firewall rules for better security
4. Click **"Confirm"**

### Step 1.4: Get Connection String

1. Go to **Database** → Your Cluster
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://movie-booking-api:<password>@movie-booking-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name after `.net/`: 
   ```
   mongodb+srv://movie-booking-api:YOUR_PASSWORD@movie-booking-prod.xxxxx.mongodb.net/movie-booking?retryWrites=true&w=majority
   ```

✅ **Save this connection string - you'll need it for backend deployment!**

---

## 🔧 Part 2: Setup Google Cloud Project

### Step 2.1: Install and Initialize gcloud CLI

```bash
# Install gcloud CLI (if not already installed)
# Visit: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project ID (or create a new one)
gcloud projects create movie-booking-app --name="Movie Booking Platform"

# Set the project
gcloud config set project movie-booking-app

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Set default region (choose closest to you)
gcloud config set run/region us-central1
```

### Step 2.2: Configure Docker for Google Cloud

```bash
# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker
```

---

## 🔨 Part 3: Deploy Backend to Cloud Run

### Step 3.1: Build Backend Docker Image

```bash
# Navigate to backend directory
cd backend

# Build the Docker image
# Replace PROJECT_ID with your actual Google Cloud project ID
gcloud builds submit --tag gcr.io/movie-booking-app/backend:latest

# Or use Docker directly (then push):
docker build -t gcr.io/movie-booking-app/backend:latest .
docker push gcr.io/movie-booking-app/backend:latest
```

### Step 3.2: Deploy Backend to Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy backend \
  --image gcr.io/movie-booking-app/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60 \
  --set-env-vars NODE_ENV=production

# You'll get a service URL like:
# https://backend-xxxxxxxxxx-uc.a.run.app
```

### Step 3.3: Set Backend Environment Variables

**IMPORTANT**: Set these environment variables in Cloud Run:

```bash
# Set all environment variables at once
gcloud run services update backend \
  --region us-central1 \
  --update-env-vars \
NODE_ENV=production,\
PORT=8080,\
MONGO_URI="mongodb+srv://movie-booking-api:YOUR_PASSWORD@cluster.mongodb.net/movie-booking?retryWrites=true&w=majority",\
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars",\
JWT_EXPIRE=7d,\
RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXX",\
RAZORPAY_KEY_SECRET="YYYYYYYYYYYYYYYYYYYY",\
FRONTEND_URL="https://your-frontend-url-will-be-added-later.run.app"
```

**Or set them via Google Cloud Console:**
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on **backend** service
3. Click **"Edit & Deploy New Revision"**
4. Scroll to **"Container, Variables & Secrets, Connections, Security"**
5. Click **"Variables & Secrets"** tab
6. Add all variables from `backend/env.production.template`

### Step 3.4: Test Backend

```bash
# Get your backend URL
BACKEND_URL=$(gcloud run services describe backend --region us-central1 --format 'value(status.url)')

# Test health endpoint
curl $BACKEND_URL/api/health

# Expected response:
# {"status":"success","message":"Movie Booking API is running","timestamp":"2024-..."}
```

✅ **Save your backend URL! You'll need it for frontend deployment.**

---

## 🎨 Part 4: Deploy Frontend to Cloud Run

### Step 4.1: Build Frontend Docker Image

```bash
# Navigate to frontend directory
cd ../frontend

# Build the Docker image
gcloud builds submit --tag gcr.io/movie-booking-app/frontend:latest

# Or use Docker directly:
docker build -t gcr.io/movie-booking-app/frontend:latest .
docker push gcr.io/movie-booking-app/frontend:latest
```

### Step 4.2: Deploy Frontend to Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy frontend \
  --image gcr.io/movie-booking-app/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60 \
  --set-env-vars NODE_ENV=production

# You'll get a service URL like:
# https://frontend-xxxxxxxxxx-uc.a.run.app
```

### Step 4.3: Set Frontend Environment Variables

```bash
# Replace BACKEND_URL with your actual backend URL from Step 3.4
gcloud run services update frontend \
  --region us-central1 \
  --update-env-vars \
NEXT_PUBLIC_API_URL="https://backend-xxxxxxxxxx-uc.a.run.app",\
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXX"
```

### Step 4.4: Update Backend CORS

Now update backend's `FRONTEND_URL` with your frontend URL:

```bash
# Replace with your actual frontend URL
gcloud run services update backend \
  --region us-central1 \
  --update-env-vars FRONTEND_URL="https://frontend-xxxxxxxxxx-uc.a.run.app"
```

### Step 4.5: Test Frontend

Open your frontend URL in a browser:
```
https://frontend-xxxxxxxxxx-uc.a.run.app
```

You should see your movie booking platform! 🎉

---

## ✅ Part 5: Post-Deployment Verification

### Checklist

- [ ] **Backend Health Check**: Visit `https://backend-xxx.run.app/api/health`
- [ ] **Frontend Loads**: Open `https://frontend-xxx.run.app`
- [ ] **User Registration**: Create a new account
- [ ] **User Login**: Login with created account
- [ ] **Browse Movies**: View movies list
- [ ] **Browse Shows**: View shows list
- [ ] **Theater Owner**: Login as theater owner and add a movie
- [ ] **Create Show**: Theater owner creates a show
- [ ] **Book Tickets**: User books tickets
- [ ] **Payment**: Complete payment with Razorpay
- [ ] **Booking Confirmation**: See booking confirmation
- [ ] **My Bookings**: View booking in "My Bookings"

### Test Payment with Live Razorpay

Since you're using **LIVE** Razorpay keys:
- ⚠️ **Real money will be charged!**
- Test with a small amount (₹1) first
- Or keep using **TEST** keys until fully ready

---

## 🔐 Part 6: Security Best Practices

### 6.1: Use Secret Manager (Recommended)

Instead of environment variables, use Google Secret Manager:

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "your-mongodb-uri" | gcloud secrets create mongodb-uri --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-razorpay-secret" | gcloud secrets create razorpay-secret --data-file=-

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Update Cloud Run to use secrets
gcloud run services update backend \
  --region us-central1 \
  --update-secrets MONGO_URI=mongodb-uri:latest,\
JWT_SECRET=jwt-secret:latest,\
RAZORPAY_KEY_SECRET=razorpay-secret:latest
```

### 6.2: Enable Cloud Armor (DDoS Protection)

```bash
# Create security policy
gcloud compute security-policies create movie-booking-policy \
  --description "Security policy for movie booking app"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy movie-booking-policy \
  --expression "true" \
  --action "rate-based-ban" \
  --rate-limit-threshold-count 100 \
  --rate-limit-threshold-interval-sec 60 \
  --ban-duration-sec 600
```

### 6.3: Setup HTTPS Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service frontend \
  --domain www.yourdomain.com \
  --region us-central1

# Follow DNS instructions provided by the command
```

---

## 📊 Part 7: Monitoring and Logging

### View Logs

```bash
# Backend logs
gcloud run services logs read backend --region us-central1 --limit 50

# Frontend logs
gcloud run services logs read frontend --region us-central1 --limit 50

# Follow logs in real-time
gcloud run services logs tail backend --region us-central1
```

### Setup Monitoring Dashboard

1. Go to [Cloud Console Monitoring](https://console.cloud.google.com/monitoring)
2. Click **"Dashboards"** → **"Create Dashboard"**
3. Add metrics:
   - Request count
   - Request latency
   - Error rate
   - Memory usage
   - CPU usage

### Setup Alerts

```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate above 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=60s
```

---

## 💰 Part 8: Cost Optimization

### Current Setup Costs (Estimated)

- **Cloud Run**: ~$0-5/month (with free tier)
- **MongoDB Atlas**: Free tier (512MB) or $9/month (Shared)
- **Container Registry**: ~$0.26/GB/month
- **Cloud Build**: First 120 builds/day free

### Optimization Tips

1. **Use Minimum Instances: 0** (scale to zero when idle)
2. **Set Maximum Instances: 10** (prevent runaway costs)
3. **Use Shared MongoDB** (upgrade only when needed)
4. **Enable Cloud CDN** (cache static assets)
5. **Compress Images** (reduce storage costs)

---

## 🔄 Part 9: CI/CD with Cloud Build (Optional)

Create `cloudbuild.yaml` for automatic deployments:

```yaml
# backend/cloudbuild.yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA', '.']
  
  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'backend'
      - '--image=gcr.io/$PROJECT_ID/backend:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'

images:
  - 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA'
```

Setup trigger:
```bash
gcloud builds triggers create github \
  --repo-name=your-repo \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=backend/cloudbuild.yaml
```

---

## 🐛 Troubleshooting

### Issue: "Container failed to start"
**Solution**: Check logs for errors:
```bash
gcloud run services logs read backend --region us-central1 --limit 100
```

### Issue: "502 Bad Gateway"
**Solution**: 
- Check if PORT is set to 8080 for backend, 3000 for frontend
- Verify healthcheck endpoint works
- Check memory limits (increase if needed)

### Issue: "CORS errors"
**Solution**:
- Verify `FRONTEND_URL` in backend env vars
- Check backend CORS configuration
- Make sure frontend is using correct API URL

### Issue: "Database connection failed"
**Solution**:
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check MongoDB connection string
- Ensure database user has correct permissions

### Issue: "Payment not working"
**Solution**:
- Verify Razorpay keys are LIVE (not test)
- Check Razorpay dashboard for errors
- Verify webhook URLs (if configured)

---

## 📱 Part 10: Mobile Access

Your app is now accessible from any device:
- **Desktop**: `https://frontend-xxx.run.app`
- **Mobile**: Same URL works!
- **PWA**: Add to home screen for app-like experience

---

## 🚀 Part 11: Going Live Checklist

Before announcing your platform:

- [ ] Test all features thoroughly
- [ ] Complete Razorpay KYC for live payments
- [ ] Setup custom domain (optional)
- [ ] Configure SSL certificate (automatic with Cloud Run)
- [ ] Setup monitoring and alerts
- [ ] Create backup strategy for MongoDB
- [ ] Add terms of service and privacy policy
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Load test with tools like Apache JMeter
- [ ] Setup error tracking (Sentry, Bugsnag)
- [ ] Create admin dashboard for monitoring
- [ ] Document API for future maintenance

---

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Razorpay Documentation](https://razorpay.com/docs/)

---

## 🎉 Congratulations!

Your **Movie Booking Platform** is now **LIVE** on Google Cloud Run! 🚀

**Your URLs:**
- Frontend: `https://frontend-xxx.run.app`
- Backend: `https://backend-xxx.run.app`

**Features Live:**
✅ User authentication  
✅ Movie management  
✅ Theater management  
✅ Showtime scheduling  
✅ Seat selection  
✅ Payment processing (Razorpay)  
✅ Booking management  
✅ Auto-scaling  
✅ High availability  

**Now accepting real bookings! 🎬🍿💳**

---

## 💡 Quick Commands Reference

```bash
# Redeploy backend
cd backend && gcloud builds submit --tag gcr.io/movie-booking-app/backend:latest && \
gcloud run deploy backend --image gcr.io/movie-booking-app/backend:latest --region us-central1

# Redeploy frontend
cd frontend && gcloud builds submit --tag gcr.io/movie-booking-app/frontend:latest && \
gcloud run deploy frontend --image gcr.io/movie-booking-app/frontend:latest --region us-central1

# View logs
gcloud run services logs tail backend --region us-central1
gcloud run services logs tail frontend --region us-central1

# Get service URLs
gcloud run services list --region us-central1

# Update environment variable
gcloud run services update backend --region us-central1 --update-env-vars KEY=VALUE

# Scale service
gcloud run services update backend --region us-central1 --min-instances 1 --max-instances 20
```

---

**Need help?** Check the troubleshooting section or Google Cloud documentation!

