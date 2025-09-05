# 🚂 Railway Database Credentials for BDS PRO

## Your Railway Connection Details

Based on your Railway dashboard, here are your database credentials:

### Database Connection:
- **Host**: `switchback.proxy.rlwy.net`
- **Port**: `28780`
- **Username**: `root`
- **Password**: `********` (replace with your actual password)
- **Database**: `railway`

### Connection URL:
```
mysql://root:********@switchback.proxy.rlwy.net:28780/railway
```

### Raw MySQL Command:
```bash
mysql -h switchback.proxy.rlwy.net -u root -p ******** --port 28780 --protocol=TCP railway
```

## 🔧 **Step 1: Update Netlify Environment Variables**

Go to your Netlify dashboard and add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DB_HOST` | `switchback.proxy.rlwy.net` | Railway host |
| `DB_USER` | `root` | Railway username |
| `DB_PASSWORD` | `your-actual-password` | Your Railway password |
| `DB_NAME` | `railway` | Database name |
| `DB_PORT` | `28780` | Railway port |

### How to Add Environment Variables:
1. Go to your Netlify site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Click "Add variable"
4. Add each variable with its value
5. Click "Save"

## 🚀 **Step 2: Deploy and Test**

### Deploy Your Project:
1. Your code is already pushed to GitHub
2. Netlify will automatically deploy with new environment variables
3. Wait 2-3 minutes for deployment to complete

### Test Database Connection:
1. Visit: `https://your-site.netlify.app/api/setup-database`
2. You should see: `{"success": true, "message": "Database setup completed successfully!"}`
3. If successful, your database schema is initialized

### Test User Registration:
1. Go to: `https://your-site.netlify.app/signup`
2. Create a new account
3. Check Railway dashboard → Database → Data
4. You should see the new user in the `users` table

## 🧪 **Step 3: Verify Database Setup**

### Check Railway Dashboard:
1. Go to [railway.app](https://railway.app)
2. Click on your database
3. Go to "Data" tab
4. You should see these tables:
   - `users`
   - `transactions`
   - `referrals`
   - `investment_plans`
   - `user_investments`
   - `system_settings`

### Test API Endpoints:
- **Health Check**: `GET /api/auth/health`
- **User Registration**: `POST /api/auth/register`
- **User Login**: `POST /api/auth/login`
- **Dashboard Data**: `GET /api/dashboard/user`
- **Balance Check**: `GET /api/deposits/balance`

## 🔍 **Step 4: Troubleshooting**

### Common Issues:

#### 1. **Connection Failed**
- **Check password**: Make sure you copied the correct password
- **Check environment variables**: Verify all variables are set in Netlify
- **Check Railway status**: Ensure your database is running

#### 2. **Schema Creation Failed**
- **Check permissions**: Ensure user has CREATE privileges
- **Check logs**: Review Railway database logs
- **Retry setup**: Visit `/api/setup-database` again

#### 3. **Authentication Issues**
- **Check JWT_SECRET**: Ensure it's set in Netlify
- **Check Firebase config**: Verify Firebase environment variables
- **Check logs**: Review Netlify function logs

### Debug Commands:
```bash
# Test database connection
curl https://your-site.netlify.app/api/setup-database

# Check function logs
netlify functions:log auth
netlify functions:log dashboard
```

## 🎯 **Step 5: Production Checklist**

### Before Going Live:
- [ ] Railway database is active and accessible
- [ ] All environment variables are set in Netlify
- [ ] Database schema is initialized
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads with real data
- [ ] Google authentication works
- [ ] All API endpoints respond correctly

### Performance Monitoring:
- [ ] Monitor Railway database metrics
- [ ] Check Netlify function performance
- [ ] Monitor error rates
- [ ] Set up alerts for critical issues

## 🎉 **Success!**

Once everything is working:
- ✅ **Real Database**: Your data is stored in Railway
- ✅ **User Management**: Registration and login work
- ✅ **Data Persistence**: All data is saved
- ✅ **Production Ready**: Scalable and reliable
- ✅ **Google Auth**: OAuth integration works
- ✅ **Complete Platform**: All features functional

## 📞 **Support**

### Railway Support:
- **Documentation**: [docs.railway.app](https://docs.railway.app)
- **Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Status**: [status.railway.app](https://status.railway.app)

### BDS PRO Support:
- **Check logs**: Netlify function logs
- **Test endpoints**: Verify API responses
- **Check database**: Railway dashboard
- **Review this guide**: Step-by-step instructions

## 🚀 **Your BDS PRO Platform is Ready!**

With Railway database configured:
- **Users can register and login**
- **Data is stored securely in Railway**
- **Dashboard shows real data**
- **All features are functional**
- **Ready for production use**

**Congratulations! Your crypto trading platform is now powered by Railway!** 🚂✨
