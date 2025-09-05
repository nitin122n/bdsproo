# 🚀 Vercel Deployment Guide for BDS PRO

This guide will help you deploy your BDS PRO crypto trading platform to Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Railway MySQL database (already configured)

## 🚀 Deployment Steps

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. **Deploy to Vercel**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure project settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### 3. **Environment Variables Setup**

In Vercel dashboard, go to **Settings > Environment Variables** and add:

```env
# Database Configuration
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

### 4. **Deploy**

1. **Click "Deploy"**
2. **Wait for deployment to complete**
3. **Your app will be available at:** `https://your-app.vercel.app`

## 🔧 Vercel Configuration

### **vercel.json**
- Routes API calls to backend
- Configures build settings
- Sets up serverless functions

### **API Routes**
- `/api/health` - Health check endpoint
- All backend routes are available at `/api/*`

## 🗄️ Database Setup

### **Railway MySQL**
1. **Go to Railway Dashboard**
2. **Select your MySQL service**
3. **Go to "Connect" tab**
4. **Copy connection details**
5. **Update Vercel environment variables**

### **Database Migration**
```bash
# Run migrations on Railway
npm run migrate
```

## 🌐 Custom Domain (Optional)

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to "Domains" tab**
4. **Add your custom domain**
5. **Update environment variables with new domain**

## 🔍 Troubleshooting

### **Common Issues:**

1. **Database Connection Failed**
   - Check Railway MySQL credentials
   - Verify environment variables in Vercel
   - Ensure Railway MySQL is running

2. **Build Errors**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

3. **API Routes Not Working**
   - Verify vercel.json configuration
   - Check API route file structure
   - Ensure proper CORS settings

### **Debug Commands:**
```bash
# Check build locally
npm run build

# Test API routes
curl https://your-app.vercel.app/api/health

# Check logs in Vercel dashboard
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

**Your BDS PRO platform is now ready for production! 🎉**
