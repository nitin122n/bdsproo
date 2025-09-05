# 🚂 Railway Database Setup Guide for BDS PRO

## Overview
This guide will help you set up Railway MySQL database for your BDS PRO crypto trading platform.

## 🚀 **Step 1: Create Railway Account**

### Sign Up:
1. **Visit Railway**: Go to [railway.app](https://railway.app)
2. **Sign Up**: Click "Start a New Project"
3. **Connect GitHub**: Use your GitHub account for easy integration
4. **Verify Email**: Check your email and verify your account

## 🗄️ **Step 2: Create MySQL Database**

### Create New Project:
1. **New Project**: Click "New Project" in Railway dashboard
2. **Database**: Select "Provision MySQL" from the template gallery
3. **Wait**: Railway will provision your database (1-2 minutes)
4. **Database Ready**: You'll see your MySQL database in the dashboard

### Database Details:
- **Type**: MySQL 8.0
- **Storage**: 1GB (free tier)
- **Memory**: 1GB RAM
- **Region**: US West (or closest to your users)

## 🔑 **Step 3: Get Connection Details**

### Access Database Credentials:
1. **Click on your database** in the Railway dashboard
2. **Go to "Connect" tab**
3. **Copy the connection details**:

| Field | Value | Description |
|-------|-------|-------------|
| **Host** | `containers-us-west-xxx.railway.app` | Database host |
| **Port** | `3306` | Database port |
| **Database** | `railway` | Database name |
| **Username** | `root` | Database user |
| **Password** | `your-generated-password` | Database password |

### Example Connection String:
```
Host: containers-us-west-123.railway.app
Port: 3306
Database: railway
Username: root
Password: abc123def456ghi789
```

## ⚙️ **Step 4: Configure Netlify Environment Variables**

### In Netlify Dashboard:
1. Go to your site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DB_HOST` | `containers-us-west-xxx.railway.app` | Your Railway host |
| `DB_USER` | `root` | Railway username |
| `DB_PASSWORD` | `your-railway-password` | Your Railway password |
| `DB_NAME` | `railway` | Database name |
| `DB_PORT` | `3306` | Port number |
| `JWT_SECRET` | `your-secret-key` | JWT signing secret |
| `JWT_EXPIRES_IN` | `24h` | Token expiration |

### Example Environment Variables:
```env
DB_HOST=containers-us-west-123.railway.app
DB_USER=root
DB_PASSWORD=abc123def456ghi789
DB_NAME=railway
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

## 🚀 **Step 5: Deploy and Initialize**

### Deploy Your Project:
1. **Push to GitHub**: Your code is already pushed
2. **Netlify Deploy**: Netlify will automatically deploy
3. **Wait**: 2-3 minutes for deployment to complete

### Initialize Database:
1. **Visit Setup Endpoint**: Go to `https://your-site.netlify.app/api/setup-database`
2. **Check Response**: Should show "Database setup completed successfully!"
3. **Verify Tables**: Database schema will be created automatically

### Expected Response:
```json
{
  "success": true,
  "message": "Database setup completed successfully!",
  "database": "Connected",
  "schema": "Initialized"
}
```

## 🧪 **Step 6: Test Your Database**

### Test Database Connection:
1. **Visit your site**: `https://your-site.netlify.app`
2. **Register a user**: Create a new account
3. **Check Railway**: Go to Railway dashboard → Database → Data
4. **Verify**: You should see the new user in the `users` table

### Test API Endpoints:
- **Registration**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Dashboard**: `GET /api/dashboard/user`
- **Balance**: `GET /api/deposits/balance`

## 📊 **Step 7: Monitor Your Database**

### Railway Dashboard:
1. **Metrics**: View database performance
2. **Logs**: Check database logs
3. **Data**: Browse your tables
4. **Settings**: Configure database settings

### Database Tables Created:
- `users` - User accounts and profiles
- `transactions` - All financial transactions
- `referrals` - Referral relationships
- `investment_plans` - Available investment plans
- `user_investments` - User investment records
- `system_settings` - System configuration

## 🔧 **Step 8: Advanced Configuration**

### Connection Pooling:
- **Max Connections**: 10 (configured automatically)
- **Timeout**: 60 seconds
- **SSL**: Enabled (required by Railway)
- **Charset**: UTF8MB4

### Performance Optimization:
- **Indexes**: Automatically created for optimal performance
- **Views**: Created for easier querying
- **Foreign Keys**: Proper relationships maintained

## 🚨 **Troubleshooting**

### Common Issues:

#### 1. **Connection Failed**
- **Check credentials**: Verify all environment variables
- **Check Railway status**: Ensure database is running
- **Check network**: Verify Railway is accessible

#### 2. **Schema Creation Failed**
- **Check permissions**: Ensure user has CREATE privileges
- **Check syntax**: Verify SQL syntax is correct
- **Check logs**: Review Railway database logs

#### 3. **Slow Queries**
- **Check indexes**: Ensure proper indexes exist
- **Check connection pool**: Monitor connection usage
- **Check Railway metrics**: Review database performance

### Debug Commands:
```bash
# Test database connection
curl https://your-site.netlify.app/api/setup-database

# Check function logs
netlify functions:log auth
netlify functions:log dashboard
```

## 💰 **Railway Pricing**

### Free Tier:
- **Storage**: 1GB
- **Memory**: 1GB RAM
- **Bandwidth**: Unlimited
- **Connections**: Up to 10 concurrent

### Paid Plans:
- **Hobby**: $5/month - 8GB storage, 1GB RAM
- **Pro**: $20/month - 32GB storage, 8GB RAM
- **Team**: $99/month - 128GB storage, 32GB RAM

## 🎯 **Benefits of Railway**

### Advantages:
- ✅ **Easy Setup**: Simple configuration
- ✅ **Free Tier**: Generous free allowance
- ✅ **Auto-scaling**: Handles traffic spikes
- ✅ **MySQL Compatible**: Works with existing code
- ✅ **SSL Support**: Secure connections
- ✅ **Monitoring**: Built-in metrics and logs

### Perfect For:
- **Startups**: Free tier is generous
- **Development**: Easy to set up and test
- **Production**: Reliable and scalable
- **Netlify**: Seamless integration

## 🎉 **Success!**

Your BDS PRO platform now has:
- ✅ **Railway MySQL Database**: Fully configured
- ✅ **User Management**: Registration and login
- ✅ **Data Persistence**: All data stored securely
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Production Ready**: Scalable and reliable

## 📞 **Support**

### Railway Support:
- **Documentation**: [docs.railway.app](https://docs.railway.app)
- **Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub**: [github.com/railwayapp](https://github.com/railwayapp)

### BDS PRO Support:
- **Check logs**: Netlify function logs
- **Test endpoints**: Verify API responses
- **Check database**: Railway dashboard
- **Review guide**: This setup guide

## 🚀 **Your BDS PRO Platform is Live!**

With Railway database:
- **Users can register and login**
- **Data is stored securely**
- **Dashboard shows real data**
- **All features are functional**
- **Ready for production use**

**Congratulations! Your crypto trading platform is now powered by Railway!** 🚂✨
