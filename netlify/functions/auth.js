// Authentication functions for BDS PRO
const { testConnection } = require('../backend/config/database');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { path, httpMethod, body } = event;
    
    if (path.includes('/register') && httpMethod === 'POST') {
      return handleRegister(event, headers);
    } else if (path.includes('/login') && httpMethod === 'POST') {
      return handleLogin(event, headers);
    } else if (path.includes('/google') && httpMethod === 'GET') {
      return handleGoogleAuth(event, headers);
    } else if (path.includes('/verify') && httpMethod === 'POST') {
      return handleVerifyToken(event, headers);
    }
    
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Auth endpoint not found' })
    };
  } catch (error) {
    console.error('Auth Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Internal server error', error: error.message })
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
    
    // Create user
    const user = {
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
    
    // Generate JWT token
    const token = generateJWT({ userId: user.id, email: user.email });
    
    // Store user data (in production, save to database)
    console.log('New user registered:', user);
    
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
    
    // In demo mode, accept any valid email/password
    const user = {
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
    
    const token = generateJWT({ userId: user.id, email: user.email });
    
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
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://your-site.netlify.app'}/dashboard?token=${token}`;
    
    return {
      statusCode: 302,
      headers: {
        ...headers,
        'Location': redirectUrl
      },
      body: ''
    };
  } catch (error) {
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
    
    // In demo mode, accept any token
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

// Helper functions
const generateReferralCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

const generateJWT = (payload) => {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};
