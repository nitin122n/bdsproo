// Netlify Function for API endpoints
const { testConnection } = require('../backend/config/database');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const { path, httpMethod, body } = event;
    
    // Route handling
    if (path.includes('/api/auth/register') && httpMethod === 'POST') {
      return handleRegister(event, headers);
    } else if (path.includes('/api/auth/google') && httpMethod === 'GET') {
      return handleGoogleAuth(event, headers);
    } else if (path.includes('/api/auth/login') && httpMethod === 'POST') {
      return handleLogin(event, headers);
    } else if (path.includes('/api/health') || path === '/api') {
      return handleHealthCheck(event, headers);
    }
    
    // Default response
    return {
      statusCode: 404,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'API endpoint not found',
        availableEndpoints: [
          'POST /api/auth/register',
          'GET /api/auth/google',
          'POST /api/auth/login',
          'GET /api/health'
        ]
      }),
    };
  } catch (error) {
    console.error('API Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message,
      }),
    };
  }
};

// Handle user registration
const handleRegister = async (event, headers) => {
  try {
    const data = JSON.parse(event.body || '{}');
    const { name, email, password, confirmPassword, referralCode } = data;
    
    // Basic validation
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
    
    // In demo mode, simulate successful registration
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      account_balance: 0,
      total_earning: 0,
      rewards: 0,
      created_at: new Date().toISOString()
    };
    
    // Generate a simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email })).toString('base64');
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Account created successfully!',
        data: {
          user,
          token
        }
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

// Handle Google authentication
const handleGoogleAuth = async (event, headers) => {
  try {
    // In demo mode, redirect to dashboard with mock user
    const mockUser = {
      id: `google_user_${Date.now()}`,
      name: 'Google User',
      email: 'user@gmail.com',
      account_balance: 1000,
      total_earning: 150,
      rewards: 50
    };
    
    const token = Buffer.from(JSON.stringify({ userId: mockUser.id, email: mockUser.email })).toString('base64');
    
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

// Handle login
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
    
    // In demo mode, accept any email/password
    const user = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      account_balance: 1000,
      total_earning: 150,
      rewards: 50
    };
    
    const token = Buffer.from(JSON.stringify({ userId: user.id, email })).toString('base64');
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Login successful!',
        data: {
          user,
          token
        }
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

// Handle health check
const handleHealthCheck = async (event, headers) => {
  try {
    const dbConnected = await testConnection();
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'BDS PRO API is running',
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
        message: 'BDS PRO API is running in demo mode',
        timestamp: new Date().toISOString(),
        database: 'Demo Mode',
        environment: 'demo'
      })
    };
  }
};
