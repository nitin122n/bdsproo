# 🌍 PlanetScale Database Setup Guide for BDS PRO

## Overview
This guide will help you set up PlanetScale (MySQL-compatible) database for your BDS PRO crypto trading platform.

## 🚀 Step-by-Step Setup

### Step 1: Create PlanetScale Account

1. **Visit PlanetScale**: Go to [planetscale.com](https://planetscale.com)
2. **Sign Up**: Click "Start building for free"
3. **Connect GitHub**: Use your GitHub account for easy integration
4. **Verify Email**: Check your email and verify your account

### Step 2: Create Database

1. **Create New Database**:
   - Click "Create database"
   - Name: `bds-pro-db`
   - Region: Choose closest to your users
   - Click "Create database"

2. **Wait for Setup**: Database creation takes 1-2 minutes

### Step 3: Get Connection Details

1. **Access Database Dashboard**:
   - Click on your `bds-pro-db` database
   - Go to "Connect" tab

2. **Generate Password**:
   - Click "Generate new password"
   - Copy the password (you won't see it again!)

3. **Get Connection String**:
   - Select "Node.js" from the dropdown
   - Copy the connection details

### Step 4: Configure Environment Variables

#### For Local Development:
Create a `.env` file in your project root:
```env
# PlanetScale Database Configuration
DB_HOST=aws.connect.psdb.cloud
DB_USER=your-username-here
DB_PASSWORD=your-password-here
DB_NAME=bds-pro-db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### For Netlify Deployment:
1. Go to your Netlify site dashboard
2. Navigate to "Site settings" > "Environment variables"
3. Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DB_HOST` | `aws.connect.psdb.cloud` | PlanetScale host |
| `DB_USER` | `your-username` | Your PlanetScale username |
| `DB_PASSWORD` | `your-password` | Your PlanetScale password |
| `DB_NAME` | `bds-pro-db` | Database name |
| `DB_PORT` | `3306` | Port number |
| `JWT_SECRET` | `your-secret-key` | JWT signing secret |
| `JWT_EXPIRES_IN` | `24h` | Token expiration |
| `NEXT_PUBLIC_API_URL` | `https://your-site.netlify.app` | Your site URL |

### Step 5: Initialize Database Schema

#### Option A: Using PlanetScale Console
1. Go to your database dashboard
2. Click "Console" tab
3. Copy and paste the contents of `database/planetscale-schema.sql`
4. Execute the SQL commands

#### Option B: Using Setup Script
```bash
# Install dependencies
npm install

# Run setup script
node scripts/setup-planetscale.js
```

### Step 6: Test Connection

#### Local Testing:
```bash
# Test database connection
node scripts/setup-planetscale.js
```

#### Production Testing:
1. Deploy to Netlify
2. Check function logs in Netlify dashboard
3. Visit your API endpoints

## 📊 Database Schema

Your PlanetScale database will include these tables:

- **`users`** - User accounts and profiles
- **`transactions`** - All financial transactions
- **`referrals`** - Referral relationships
- **`investment_plans`** - Available investment plans
- **`user_investments`** - User investment records
- **`system_settings`** - System configuration

## 🔧 Configuration Files

### Database Configuration
- `backend/config/database-planetscale.js` - PlanetScale-specific config
- `database/planetscale-schema.sql` - Database schema
- `scripts/setup-planetscale.js` - Setup script

### Environment Variables
- `netlify.toml` - Netlify environment variables
- `.env` - Local development variables

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Verify credentials are correct
   - Check if database is active
   - Ensure IP is whitelisted (if required)

2. **SSL Certificate Error**
   - PlanetScale requires SSL
   - Configuration includes SSL settings

3. **Schema Creation Failed**
   - Check user permissions
   - Verify database exists
   - Run schema manually in console

4. **Environment Variables Not Working**
   - Check Netlify dashboard
   - Verify variable names match exactly
   - Redeploy after adding variables

### Debug Commands:
```bash
# Test connection locally
node -e "require('./backend/config/database-planetscale').testConnection()"

# Check environment variables
node -e "console.log(process.env.DB_HOST)"
```

## 💰 PlanetScale Pricing

### Free Tier:
- 1 database
- 1GB storage
- 1 billion reads/month
- 10 million writes/month
- Perfect for development and small projects

### Paid Plans:
- Starting at $29/month
- More storage and compute
- Additional databases
- Priority support

## 🔒 Security Best Practices

1. **Use Environment Variables**: Never hardcode credentials
2. **Rotate Passwords**: Regularly update database passwords
3. **Limit Access**: Use database user with minimal permissions
4. **Enable SSL**: Always use encrypted connections
5. **Monitor Usage**: Keep track of database usage

## 📈 Performance Optimization

1. **Connection Pooling**: Already configured for optimal performance
2. **Indexes**: Database schema includes proper indexes
3. **Query Optimization**: Use prepared statements
4. **Monitoring**: Use PlanetScale's built-in monitoring

## 🎯 Next Steps

1. **Set up PlanetScale database** (follow steps above)
2. **Configure environment variables** in Netlify
3. **Deploy your application** to Netlify
4. **Test all functionality** with real database
5. **Monitor performance** and usage

## 📞 Support

- **PlanetScale Docs**: [planetscale.com/docs](https://planetscale.com/docs)
- **PlanetScale Support**: [planetscale.com/support](https://planetscale.com/support)
- **Community Forum**: [github.com/planetscale/discussions](https://github.com/planetscale/discussions)

## 🎉 Success!

Once completed, your BDS PRO application will have:
- ✅ Real database storage
- ✅ User authentication
- ✅ Transaction tracking
- ✅ Referral system
- ✅ Investment management
- ✅ Scalable infrastructure

Your crypto trading platform is now ready for production! 🚀
