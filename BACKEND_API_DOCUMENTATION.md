# 🚀 BDS PRO Backend API Documentation

## Overview
Complete backend system built with Netlify Functions for the BDS PRO crypto trading platform.

## 🔗 API Base URL
```
https://your-site-name.netlify.app/api
```

## 📋 Available Endpoints

### 🔐 Authentication (`/api/auth/`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "referralCode": "DEMO123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "data": {
    "user": {
      "id": "user_1234567890_abc123def",
      "name": "John Doe",
      "email": "john@example.com",
      "account_balance": 0,
      "total_earning": 0,
      "rewards": 0,
      "referral_code": "ABC12345",
      "referred_by": "DEMO123",
      "created_at": "2024-01-01T00:00:00.000Z",
      "status": "active"
    },
    "token": "eyJ1c2VySWQiOiJ1c2VyXzEyMzQ1Njc4OTBfYWJjMTIzZGVmIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIn0="
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google Authentication
```http
GET /api/auth/google
```

#### Verify Token
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "your-jwt-token"
}
```

### 📊 Dashboard (`/api/dashboard/`)

#### Get User Data
```http
GET /api/dashboard/user?token=your-jwt-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "demo_user_123",
      "name": "Demo User",
      "email": "demo@bdspro.io",
      "account_balance": 2500.00,
      "total_earning": 450.00,
      "rewards": 150.00,
      "referral_code": "DEMO123",
      "level": "Professional",
      "next_milestone": "iPhone 16 Pro",
      "progress_to_milestone": 65
    }
  }
}
```

#### Get User Statistics
```http
GET /api/dashboard/stats?token=your-jwt-token
```

#### Get Transactions
```http
GET /api/dashboard/transactions?token=your-jwt-token
```

#### Get Referrals
```http
GET /api/dashboard/referrals?token=your-jwt-token
```

### 💰 Deposits & Withdrawals (`/api/deposits/`)

#### Make Deposit
```http
POST /api/deposits/deposit
Content-Type: application/json
Authorization: Bearer your-jwt-token

{
  "amount": 1000,
  "payment_method": "USDT",
  "referral_code": "DEMO123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit request submitted successfully!",
  "data": {
    "deposit": {
      "id": "dep_1234567890_abc123def",
      "amount": 1000,
      "payment_method": "USDT",
      "status": "pending",
      "referral_code": "DEMO123",
      "created_at": "2024-01-01T00:00:00.000Z",
      "processed_at": null
    }
  }
}
```

#### Make Withdrawal
```http
POST /api/deposits/withdraw
Content-Type: application/json
Authorization: Bearer your-jwt-token

{
  "amount": 500,
  "wallet_address": "0x1234567890abcdef",
  "payment_method": "USDT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully!",
  "data": {
    "withdrawal": {
      "id": "with_1234567890_abc123def",
      "amount": 500,
      "net_amount": 490,
      "admin_fee": 10,
      "wallet_address": "0x1234567890abcdef",
      "payment_method": "USDT",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00.000Z",
      "estimated_completion": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

#### Get Transaction History
```http
GET /api/deposits/history?token=your-jwt-token
```

#### Get Account Balance
```http
GET /api/deposits/balance?token=your-jwt-token
```

### 🏥 Health Check
```http
GET /api/health
```

## 🔧 Function Structure

### Netlify Functions
- `auth.js` - Authentication operations
- `dashboard.js` - User data and statistics
- `deposits.js` - Deposits and withdrawals
- `api.js` - Main router and health check

### Database Integration
- Cloud database support (PlanetScale, Railway, Neon)
- Demo mode for testing without database
- Automatic fallback to demo data

## 🚀 Deployment

### Environment Variables
```env
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# API Configuration
NEXT_PUBLIC_API_URL=https://your-site-name.netlify.app
```

### Netlify Configuration
- Functions directory: `netlify/functions/`
- Automatic routing via `netlify.toml`
- CORS enabled for all endpoints
- Environment variables configured

## 📱 Frontend Integration

### API Service Example
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || window.location.origin;

// Register user
const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Get user data
const getUserData = async (token) => {
  const response = await fetch(`${API_BASE}/api/dashboard/user?token=${token}`);
  return response.json();
};

// Make deposit
const makeDeposit = async (depositData, token) => {
  const response = await fetch(`${API_BASE}/api/deposits/deposit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(depositData)
  });
  return response.json();
};
```

## 🔒 Security Features

- JWT token authentication
- CORS protection
- Input validation
- Rate limiting (via Netlify)
- Environment variable protection
- SSL/TLS encryption

## 📊 Demo Mode

When no database is configured, the API runs in demo mode with:
- Mock user data
- Simulated transactions
- Demo authentication
- Sample statistics

## 🛠️ Testing

### Test Authentication
```bash
curl -X POST https://your-site.netlify.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","confirmPassword":"password123"}'
```

### Test Health Check
```bash
curl https://your-site.netlify.app/api/health
```

## 🚨 Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 📈 Performance

- Serverless functions for scalability
- Connection pooling for database
- Caching for static data
- Optimized response times

Your BDS PRO backend is now fully functional on Netlify! 🎯
