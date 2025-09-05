# 🚀 Netlify Serverless Functions Guide for BDS PRO

## Overview
This guide explains the new individual serverless functions architecture for BDS PRO, replacing the monolithic API approach with optimized, modular functions.

## 🏗️ Architecture

### Function Structure
```
netlify/functions/
├── auth/
│   └── index.js          # Authentication endpoints
├── dashboard/
│   └── index.js          # Dashboard and user data
├── deposits/
│   └── index.js          # Deposits, withdrawals, balance
└── api.js                # Fallback router
```

### Benefits of Individual Functions
- **Better Performance**: Each function loads only what it needs
- **Faster Cold Starts**: Smaller function size = faster initialization
- **Independent Scaling**: Each function scales based on its usage
- **Easier Debugging**: Isolated functions are easier to troubleshoot
- **Better Monitoring**: Granular metrics per function

## 🔐 Authentication Function (`/api/auth/*`)

### Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/auth/register` | POST | User registration | `name`, `email`, `password`, `confirmPassword`, `referralCode` |
| `/api/auth/login` | POST | User login | `email`, `password` |
| `/api/auth/google` | GET | Google OAuth | None (redirects to Google) |
| `/api/auth/verify` | POST | Verify JWT token | `token` |
| `/api/auth/logout` | POST | User logout | `token` |

### Example Usage

#### Registration
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    referralCode: 'FRIEND123'
  })
});
```

#### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});
```

## 📊 Dashboard Function (`/api/dashboard/*`)

### Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/dashboard/user` | GET | Get user profile | `token` (query or header) |
| `/api/dashboard/stats` | GET | Get user statistics | `token` (query or header) |
| `/api/dashboard/transactions` | GET | Get user transactions | `token`, `limit`, `offset` |
| `/api/dashboard/referrals` | GET | Get user referrals | `token` (query or header) |
| `/api/dashboard/update-profile` | PUT | Update user profile | `token`, `name`, `email` |
| `/api/dashboard/health` | GET | Health check | None |

### Example Usage

#### Get User Data
```javascript
const response = await fetch('/api/dashboard/user?token=your-jwt-token');
const data = await response.json();
```

#### Get Statistics
```javascript
const response = await fetch('/api/dashboard/stats', {
  headers: { 'Authorization': 'Bearer your-jwt-token' }
});
const data = await response.json();
```

## 💰 Deposits Function (`/api/deposits/*`)

### Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/deposits/deposit` | POST | Make a deposit | `token`, `amount`, `payment_method`, `referral_code` |
| `/api/deposits/withdraw` | POST | Request withdrawal | `token`, `amount`, `wallet_address`, `payment_method` |
| `/api/deposits/history` | GET | Get transaction history | `token`, `limit`, `offset`, `type` |
| `/api/deposits/balance` | GET | Get account balance | `token` (query or header) |
| `/api/deposits/plans` | GET | Get investment plans | None |
| `/api/deposits/health` | GET | Health check | None |

### Example Usage

#### Make Deposit
```javascript
const response = await fetch('/api/deposits/deposit', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    amount: 1000,
    payment_method: 'USDT',
    referral_code: 'FRIEND123'
  })
});
```

#### Get Balance
```javascript
const response = await fetch('/api/deposits/balance?token=your-jwt-token');
const data = await response.json();
```

## 🔧 Configuration

### Environment Variables
Each function uses these environment variables:

```env
# Database
DB_HOST=aws.connect.psdb.cloud
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=bds-pro-db
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# API
NEXT_PUBLIC_API_URL=https://your-site.netlify.app
```

### Netlify Configuration
The `netlify.toml` file routes API calls to the appropriate functions:

```toml
[[redirects]]
  from = "/api/auth/*"
  to = "/.netlify/functions/auth"
  status = 200

[[redirects]]
  from = "/api/dashboard/*"
  to = "/.netlify/functions/dashboard"
  status = 200

[[redirects]]
  from = "/api/deposits/*"
  to = "/.netlify/functions/deposits"
  status = 200
```

## 🚀 Deployment

### Automatic Deployment
Functions are automatically deployed when you push to your main branch:

```bash
git add .
git commit -m "Update serverless functions"
git push origin main
```

### Manual Deployment
You can also deploy manually using Netlify CLI:

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 📈 Performance Optimization

### Cold Start Optimization
- **Small Function Size**: Each function only includes necessary code
- **Connection Pooling**: Database connections are reused
- **Lazy Loading**: Dependencies are loaded only when needed

### Caching Strategy
- **Static Data**: Investment plans are cached
- **User Data**: Frequently accessed user data is cached
- **Database Queries**: Query results are cached when appropriate

## 🔍 Monitoring and Debugging

### Function Logs
View logs in Netlify dashboard:
1. Go to your site dashboard
2. Navigate to "Functions" tab
3. Click on a function to view logs

### Health Checks
Each function has a health endpoint:
- `/api/auth/health`
- `/api/dashboard/health`
- `/api/deposits/health`

### Error Handling
All functions include comprehensive error handling:
- Input validation
- Database connection errors
- Authentication errors
- Rate limiting

## 🛠️ Development

### Local Development
Test functions locally using Netlify CLI:

```bash
netlify dev
```

### Function Testing
Test individual functions:

```bash
# Test auth function
curl -X POST http://localhost:8888/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456","confirmPassword":"123456"}'

# Test dashboard function
curl -X GET "http://localhost:8888/api/dashboard/health"

# Test deposits function
curl -X GET "http://localhost:8888/api/deposits/plans"
```

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Token verification on protected endpoints
- Secure password hashing (in production)

### CORS Protection
- Proper CORS headers on all functions
- Origin validation
- Preflight request handling

### Input Validation
- Required field validation
- Data type validation
- SQL injection prevention

## 📊 Database Integration

### PlanetScale Integration
Functions automatically detect database availability:
- **Connected**: Uses real database operations
- **Demo Mode**: Returns mock data for testing

### Database Operations
Each function includes database operations:
- User management
- Transaction tracking
- Referral system
- Balance updates

## 🎯 Best Practices

### Function Design
1. **Single Responsibility**: Each function handles one concern
2. **Error Handling**: Comprehensive error responses
3. **Logging**: Detailed logging for debugging
4. **Validation**: Input validation on all endpoints

### Performance
1. **Connection Pooling**: Reuse database connections
2. **Caching**: Cache frequently accessed data
3. **Compression**: Enable response compression
4. **Timeouts**: Set appropriate timeouts

### Security
1. **Authentication**: Verify tokens on protected endpoints
2. **Validation**: Validate all inputs
3. **Rate Limiting**: Implement rate limiting
4. **HTTPS**: Always use HTTPS in production

## 🚨 Troubleshooting

### Common Issues

1. **Function Not Found (404)**
   - Check `netlify.toml` redirects
   - Verify function file exists
   - Check function name matches redirect

2. **Authentication Errors (401)**
   - Verify token is valid
   - Check token format
   - Ensure token is passed correctly

3. **Database Connection Errors**
   - Check environment variables
   - Verify database credentials
   - Check database availability

4. **CORS Errors**
   - Check CORS headers
   - Verify origin is allowed
   - Check preflight requests

### Debug Commands
```bash
# Check function status
netlify functions:list

# View function logs
netlify functions:log auth

# Test function locally
netlify dev --live
```

## 🎉 Success!

Your BDS PRO application now has:
- ✅ Individual serverless functions
- ✅ Optimized performance
- ✅ Better scalability
- ✅ Easier maintenance
- ✅ Comprehensive error handling
- ✅ Full database integration
- ✅ Production-ready architecture

The new serverless functions architecture provides better performance, scalability, and maintainability for your crypto trading platform! 🚀
