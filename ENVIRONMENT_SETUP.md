# Environment Configuration Guide

## 🚀 Production Environment Setup

This guide helps you configure your BDS PRO application for production deployment on Railway (backend) and Netlify (frontend).

## 📁 Environment Files Created

### 1. Backend Environment (Railway MySQL)
**File:** `backend/.env`
```env
# Railway MySQL Configuration
PORT=5001
NODE_ENV=production

# Railway MySQL Database Configuration
DB_HOST=your-actual-railway-host.railway.internal
DB_PORT=3306
DB_USER=your-actual-railway-user
DB_PASSWORD=your-actual-railway-password
DB_NAME=your-actual-railway-database

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration - Update with your Netlify domain
CORS_ORIGIN=https://your-netlify-app.netlify.app

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-netlify-app.netlify.app/auth/google/callback
```

### 2. React Frontend Environment
**File:** `frontend/.env`
```env
VITE_API_URL=https://your-backend-production.up.railway.app
VITE_APP_NAME=BDS PRO
VITE_APP_VERSION=1.0.0
```

### 3. Next.js Frontend Environment
**File:** `.env.local`
```env
NEXT_PUBLIC_API_URL=https://your-backend-production.up.railway.app
NEXT_PUBLIC_APP_NAME=BDS PRO
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🔧 Configuration Steps

### Step 1: Update Backend Environment Variables
1. Replace placeholder values in `backend/.env` with your actual Railway MySQL credentials
2. Update `CORS_ORIGIN` with your Netlify domain
3. Set up Google OAuth credentials

### Step 2: Update Frontend Environment Variables
1. Replace `your-backend-production.up.railway.app` with your actual Railway backend URL
2. Update both React and Next.js frontend environment files

### Step 3: Railway Deployment
1. Deploy your backend to Railway
2. Set environment variables in Railway dashboard
3. Run migration: `npm run migrate`

### Step 4: Netlify Deployment
1. Deploy your frontend to Netlify
2. Set environment variables in Netlify dashboard:
   - `VITE_API_URL` (for React frontend)
   - `NEXT_PUBLIC_API_URL` (for Next.js frontend)

## 🌐 Environment Variable Mapping

| Component | Environment Variable | Production Value |
|-----------|---------------------|------------------|
| Backend | `DB_HOST` | Railway MySQL host |
| Backend | `DB_USER` | Railway MySQL user |
| Backend | `DB_PASSWORD` | Railway MySQL password |
| Backend | `DB_NAME` | Railway MySQL database |
| Backend | `CORS_ORIGIN` | Netlify frontend URL |
| React Frontend | `VITE_API_URL` | Railway backend URL |
| Next.js Frontend | `NEXT_PUBLIC_API_URL` | Railway backend URL |

## 🔄 Migration Commands

```bash
# Local development
npm run migrate:local

# Railway production
npm run migrate

# Manual migration
node scripts/migrate-railway.js
```

## ✅ Verification

1. **Backend Health Check**: `https://your-railway-app.up.railway.app/health`
2. **Database Connection**: Should show "connected" in health check
3. **Frontend API Calls**: Should use production URLs, not localhost

## 🚨 Important Notes

- All hardcoded localhost references have been replaced with environment variables
- CORS is configured to allow your Netlify domain
- Database migration runs automatically on Railway deployment
- Health check endpoint monitors database connection status

## 🔧 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check `CORS_ORIGIN` matches your Netlify domain exactly
2. **Database Connection**: Verify Railway MySQL credentials
3. **API Calls Failing**: Check environment variables are set correctly
4. **Migration Issues**: Run migration manually if automatic fails

### Debug Commands:
```bash
# Check environment variables
echo $NEXT_PUBLIC_API_URL
echo $VITE_API_URL

# Test database connection
node scripts/migrate-railway.js

# Check backend health
curl https://your-railway-app.up.railway.app/health
```

Your application is now fully configured for production deployment! 🎉
