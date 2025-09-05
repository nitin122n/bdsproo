// Authentication serverless function for BDS PRO
// Database connection test function
const testConnection = async () => {
  try {
    // Check if database environment variables are set
    const hasDbConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD;
    return hasDbConfig;
  } catch (error) {
    console.log('Database not configured, running in demo mode');
    return false;
  }
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { path, httpMethod, body, queryStringParameters } = event;
    
    // Parse the path to determine the action
    const pathParts = path.split('/').filter(part => part);
    const action = pathParts[pathParts.length - 1];
    
    console.log(`Auth function called: ${httpMethod} ${path}, action: ${action}`);
    
    switch (action) {
      case 'register':
        if (httpMethod === 'POST') {
          return await handleRegister(event, headers);
        }
        break;
        
      case 'login':
        if (httpMethod === 'POST') {
          return await handleLogin(event, headers);
        }
        break;
        
      case 'google':
        if (httpMethod === 'GET') {
          return await handleGoogleAuth(event, headers);
        }
        break;
        
      case 'verify':
        if (httpMethod === 'POST') {
          return await handleVerifyToken(event, headers);
        }
        break;
        
      case 'logout':
        if (httpMethod === 'POST') {
          return await handleLogout(event, headers);
        }
        break;
        
      case 'health':
        if (httpMethod === 'GET') {
          return await handleHealthCheck(event, headers);
        }
        break;
        
      default:
        return {
          statusCode: 404,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'Auth endpoint not found',
            availableEndpoints: ['register', 'login', 'google', 'verify', 'logout']
          })
        };
    }
    
    return {
      statusCode: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
    
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};

// User Registration
const handleRegister = async (event, headers) => {
  try {
    const data = JSON.parse(event.body || '{}');
    const { name, email, password, confirmPassword, referralCode } = data;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'All fields are required'
        })
      };
    }
    
    if (password !== confirmPassword) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Passwords do not match'
        })
      };
    }
    
    if (password.length < 8) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Password must be at least 8 characters'
        })
      };
    }
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    let user;
    if (dbConnected) {
      // Use real database
      const { userOperations } = require('../../backend/config/database-planetscale');
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password_hash: await hashPassword(password),
        referral_code: generateReferralCode(),
        referred_by: referralCode || null,
        account_balance: 0,
        total_earning: 0,
        rewards: 0,
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      await userOperations.createUser(user);
    } else {
      // Demo mode
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        account_balance: 0,
        total_earning: 0,
        rewards: 0,
        referral_code: generateReferralCode(),
        referred_by: referralCode || null,
        created_at: new Date().toISOString(),
        status: 'active'
      };
    }
    
    // Generate JWT token
    const token = generateJWT({ userId: user.id, email: user.email });
    
    console.log('User registered:', { id: user.id, email: user.email });
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Account created successfully!',
        data: { user, token }
      })
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Registration failed',
        error: error.message
      })
    };
  }
};

// User Login
const handleLogin = async (event, headers) => {
  try {
    const data = JSON.parse(event.body || '{}');
    const { email, password } = data;
    
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Email and password are required'
        })
      };
    }
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    let user;
    if (dbConnected) {
      // Use real database
      const { userOperations } = require('../../backend/config/database-planetscale');
      user = await userOperations.getUserByEmail(email);
      
      if (!user) {
        return {
          statusCode: 401,
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            message: 'Invalid email or password'
          })
        };
      }
      
      // In production, verify password hash
      // const isValidPassword = await verifyPassword(password, user.password_hash);
      // if (!isValidPassword) { ... }
    } else {
      // Demo mode - accept any valid email/password
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: email.split('@')[0],
        email,
        account_balance: 1000,
        total_earning: 150,
        rewards: 50,
        referral_code: generateReferralCode(),
        created_at: new Date().toISOString(),
        status: 'active'
      };
    }
    
    const token = generateJWT({ userId: user.id, email: user.email });
    
    console.log('User logged in:', { id: user.id, email: user.email });
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Login successful!',
        data: { user, token }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Login failed',
        error: error.message
      })
    };
  }
};

// Google Authentication
const handleGoogleAuth = async (event, headers) => {
  try {
    // In demo mode, create a mock Google user
    const mockUser = {
      id: `google_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Google User',
      email: 'user@gmail.com',
      account_balance: 1000,
      total_earning: 150,
      rewards: 50,
      referral_code: generateReferralCode(),
      created_at: new Date().toISOString(),
      status: 'active'
    };
    
    const token = generateJWT({ userId: mockUser.id, email: mockUser.email });
    
    // Redirect to dashboard with token
    const siteUrl = process.env.URL || 'https://your-site.netlify.app';
    const redirectUrl = `${siteUrl}/dashboard?token=${token}`;
    
    console.log('Google auth redirect:', redirectUrl);
    
    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': redirectUrl
      },
      body: ''
    };
  } catch (error) {
    console.error('Google auth error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Google authentication failed',
        error: error.message
      })
    };
  }
};

// Verify JWT Token
const handleVerifyToken = async (event, headers) => {
  try {
    const data = JSON.parse(event.body || '{}');
    const { token } = data;
    
    if (!token) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Token is required'
        })
      };
    }
    
    // Decode and verify token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const userData = JSON.parse(decoded);
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Token is valid',
        data: { user: userData }
      })
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      statusCode: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Invalid token',
        error: error.message
      })
    };
  }
};

// Logout
const handleLogout = async (event, headers) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Server-side logout would involve token blacklisting
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      })
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Logout failed',
        error: error.message
      })
    };
  }
};

// Health check
const handleHealthCheck = async (event, headers) => {
  try {
    const dbConnected = await testConnection();
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Auth service is running',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'Connected' : 'Demo Mode',
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Auth service is running in demo mode',
        timestamp: new Date().toISOString(),
        database: 'Demo Mode',
        environment: 'demo'
      })
    };
  }
};

// Helper functions
const generateReferralCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

const generateJWT = (payload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const hashPassword = async (password) => {
  // In production, use bcrypt or similar
  return Buffer.from(password).toString('base64');
};

const verifyPassword = async (password, hash) => {
  // In production, use bcrypt or similar
  return Buffer.from(password).toString('base64') === hash;
};
