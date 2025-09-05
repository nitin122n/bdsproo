# 🚀 Complete Deployment Guide for BDS PRO

This guide will help you deploy your BDS PRO crypto trading platform to Vercel with Railway MySQL.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Railway account (sign up at [railway.app](https://railway.app))

## 🗄️ Step 1: Deploy MySQL Database to Railway

### 1.1 Create Railway MySQL Database
1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click **"New Project"**
4. Select **"Provision MySQL"**
5. Wait for the database to be created (2-3 minutes)

### 1.2 Get Database Credentials
1. Click on your **MySQL service**
2. Go to the **"Variables" tab**
3. Copy these values:
   ```
   MYSQLHOST=xxxx.railway.internal
   MYSQLUSER=root
   MYSQLPASSWORD=your-password
   MYSQLDATABASE=railway
   MYSQLPORT=3306
   ```

### 1.3 Run Database Migration
1. Update `.env.railway` with your actual credentials
2. Run the migration script:
   ```bash
   # Copy Railway credentials to .env
   cp .env.railway .env
   
   # Install dependencies
   npm install
   
   # Run database migration
   node scripts/deploy-mysql.js
   ```

## 🌐 Step 2: Deploy to Vercel

### 2.1 Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2.2 Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. **Import your GitHub repository**
4. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 2.3 Set Environment Variables in Vercel
In Vercel dashboard, go to **Settings > Environment Variables** and add:

```env
# Database Configuration (from Railway)
MYSQLHOST=your-railway-host
MYSQLUSER=root
MYSQLPASSWORD=your-railway-password
MYSQLDATABASE=your-railway-database
MYSQLPORT=3306

# API Configuration
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# CORS Configuration
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=production
```

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete (5-10 minutes)
3. Your app will be available at: `https://your-app.vercel.app`

## 🔧 Step 3: Verify Deployment

### 3.1 Test Your Application
1. **Visit your Vercel URL**
2. **Test the health endpoint:** `https://your-app.vercel.app/api/health`
3. **Test user registration and login**
4. **Verify database connectivity**

### 3.2 Check Logs
- **Vercel Logs:** Go to your project dashboard > Functions tab
- **Railway Logs:** Go to your MySQL service > Logs tab

## 🚨 Troubleshooting

### Common Issues:

#### **Database Connection Failed**
```bash
# Check Railway MySQL status
# Verify environment variables in Vercel
# Ensure Railway MySQL is running
```

#### **Build Errors**
```bash
# Check Node.js version (should be 18+)
# Verify all dependencies are in package.json
# Check for TypeScript errors
```

#### **API Routes Not Working**
```bash
# Verify vercel.json configuration
# Check API route file structure
# Ensure proper CORS settings
```

### Debug Commands:
```bash
# Test build locally
npm run build

# Test API routes
curl https://your-app.vercel.app/api/health

# Check database connection
node scripts/deploy-mysql.js
```

## 📊 Monitoring

### **Vercel Analytics**
- Real-time performance metrics
- User analytics
- Error tracking

### **Railway Monitoring**
- Database performance
- Connection monitoring
- Resource usage

## 🔄 Continuous Deployment

Once set up, Vercel will automatically:
- Deploy on every push to main branch
- Run build process
- Update environment variables
- Scale automatically

## 🆘 Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)
- **Project Issues:** Create GitHub issue

---

## 🎉 Success!

Your BDS PRO platform is now live and ready for production!

**Next Steps:**
1. Set up custom domain (optional)
2. Configure Google OAuth (if needed)
3. Set up monitoring and alerts
4. Configure backup strategies

**Your app URL:** `https://your-app.vercel.app`
