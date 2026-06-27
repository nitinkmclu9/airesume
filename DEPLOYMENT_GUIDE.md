# AI Resume Application - Deployment Guide

## Overview
This guide covers deploying your AI Resume application:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas

---

## Prerequisites

Before starting, ensure you have:
- GitHub account (for connecting repositories)
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- Environment variables ready

---

## Part 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Create a new project named "ai-resume"
4. Create a cluster (choose free tier M0)
5. Create a database user with username and password
6. Whitelist your IP addresses (or use 0.0.0.0/0 for development)
7. Get your connection string from "Connect" button
8. Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority`

---

## Part 2: Backend Deployment (Render)

### 1. Push Code to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/ai-resume.git
git push -u origin main
```

### 2. Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository `ai-resume`
5. Configure:
   - **Name**: `ai-resume-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or Starter if you need better uptime)

### 3. Set Environment Variables on Render
In the Render dashboard:
1. Go to your service → Environment
2. Add all variables from `backend/.env.example`:
   ```
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.vercel.app
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<generate_a_secure_random_string>
   JWT_EXPIRE=7d
   EMAIL_USER=<your_gmail>
   EMAIL_PASSWORD=<your_gmail_app_password>
   CLOUDINARY_CLOUD_NAME=<your_value>
   CLOUDINARY_API_KEY=<your_value>
   CLOUDINARY_API_SECRET=<your_value>
   OPENAI_API_KEY=<your_value>
   ADMIN_EMAIL=<your_admin_email>
   ADMIN_PASSWORD=<your_admin_password>
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### 4. Deploy Backend
1. Click "Create Web Service"
2. Wait for the deployment to complete
3. You'll get a URL like: `https://ai-resume-backend.onrender.com`
4. Copy this URL for frontend configuration

### ⚠️ Important for Render Free Tier
- Service goes to sleep after 15 minutes of inactivity
- Add wake-up ping service to keep it alive:
  ```bash
  curl https://api.render.com/v1/services/<service-id>/wake
  ```

---

## Part 3: Frontend Deployment (Vercel)

### 1. Update Frontend Configuration
1. Update [frontend/src/lib/api.ts](../frontend/src/lib/api.ts):
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
   ```

2. Create `frontend/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://ai-resume-backend.onrender.com
   ```

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `ai-resume`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`

### 3. Set Vercel Environment Variables
1. Go to project settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_API_URL = https://ai-resume-backend.onrender.com
   ```

### 4. Deploy
1. Click "Deploy"
2. Wait for deployment (usually 2-3 minutes)
3. You'll get a URL like: `https://ai-resume.vercel.app`

---

## Part 4: Update Backend CORS

### Update Backend CORS to Allow Vercel Frontend
1. Go back to Render dashboard
2. Update environment variable:
   ```
   FRONTEND_URL=https://ai-resume.vercel.app
   ```
3. Service will automatically redeploy

---

## Part 5: Testing

### Test Backend API
```bash
# Test connection
curl https://ai-resume-backend.onrender.com/api/health

# Test Auth
curl -X POST https://ai-resume-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Frontend
1. Visit: https://ai-resume.vercel.app
2. Try to register/login
3. Check browser console for any errors

---

## Troubleshooting

### Backend not connecting
- Check MONGODB_URI is correct
- Ensure MongoDB Atlas has your Render IP whitelisted (use 0.0.0.0/0 for now)
- Check environment variables are set correctly

### CORS errors
- Update FRONTEND_URL in Render environment variables
- Verify NEXT_PUBLIC_API_URL in Vercel environment variables

### Emails not sending
- Ensure Gmail app password is used (not regular password)
- Enable "Less secure app access" if needed

### Database connection timeout
- Check MongoDB Atlas cluster is running
- Verify connection string format
- Increase connection timeout in code if needed

---

## Domain Setup (Optional)

### Connect Custom Domain to Vercel
1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records with values provided by Vercel

### Connect Custom Domain to Render
1. Go to Render service → Settings → Custom Domains
2. Add your backend domain
3. Update DNS records

---

## Monitoring & Logs

### Vercel Logs
- Go to Vercel dashboard → your project → Deployments
- Click deployment → Logs

### Render Logs
- Go to Render dashboard → your service → Logs
- Real-time logs displayed

---

## Next Steps

1. Set up error monitoring (Sentry, LogRocket)
2. Configure email service (SendGrid, Mailgun)
3. Set up analytics (Google Analytics, Mixpanel)
4. Configure automated backups for MongoDB
5. Set up CI/CD for automatic deployments on git push

---

## Quick Reference

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://ai-resume.vercel.app |
| Backend API | Render | https://ai-resume-backend.onrender.com |
| Database | MongoDB Atlas | mongodb+srv://... |

---

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com

