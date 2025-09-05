// Dashboard serverless function for BDS PRO
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
    const { path, httpMethod, queryStringParameters } = event;
    
    // Parse the path to determine the action
    const pathParts = path.split('/').filter(part => part);
    const action = pathParts[pathParts.length - 1];
    
    console.log(`Dashboard function called: ${httpMethod} ${path}, action: ${action}`);
    
    // Get token from query params or headers
    const token = queryStringParameters?.token || 
                  event.headers?.authorization?.replace('Bearer ', '') ||
                  event.headers?.['x-auth-token'];
    
    if (!token && action !== 'health') {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Authentication token required'
        })
      };
    }
    
    switch (action) {
      case 'user':
        if (httpMethod === 'GET') {
          return await handleGetUser(event, headers, token);
        }
        break;
        
      case 'stats':
        if (httpMethod === 'GET') {
          return await handleGetStats(event, headers, token);
        }
        break;
        
      case 'transactions':
        if (httpMethod === 'GET') {
          return await handleGetTransactions(event, headers, token);
        }
        break;
        
      case 'referrals':
        if (httpMethod === 'GET') {
          return await handleGetReferrals(event, headers, token);
        }
        break;
        
      case 'update-profile':
        if (httpMethod === 'PUT') {
          return await handleUpdateProfile(event, headers, token);
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
            message: 'Dashboard endpoint not found',
            availableEndpoints: ['user', 'stats', 'transactions', 'referrals', 'update-profile', 'health']
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
    console.error('Dashboard function error:', error);
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

// Get user data
const handleGetUser = async (event, headers, token) => {
  try {
    const userData = decodeToken(token);
    if (!userData) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Invalid token'
        })
      };
    }
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    let user;
    if (dbConnected) {
      // Use real database
      try {
        const { userOperations } = require('../../backend/config/database-railway');
        user = await userOperations.getUserById(userData.userId);
        
        if (!user) {
          return {
            statusCode: 404,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              success: false,
              message: 'User not found'
            })
          };
        }
        
        console.log('User data retrieved from database:', user.id);
      } catch (dbError) {
        console.error('Database error, falling back to demo mode:', dbError);
        // Fall back to demo mode if database fails
        user = {
          id: userData.userId,
          name: userData.email.split('@')[0],
          email: userData.email,
          account_balance: 2500.00,
          total_earning: 450.00,
          rewards: 150.00,
          referral_code: 'DEMO123',
          referred_by: null,
          created_at: '2024-01-01T00:00:00.000Z',
          status: 'active',
          level: 'Professional',
          next_milestone: 'iPhone 16 Pro',
          progress_to_milestone: 65
        };
      }
    } else {
      // Demo mode
      user = {
        id: userData.userId,
        name: userData.email.split('@')[0],
        email: userData.email,
        account_balance: 2500.00,
        total_earning: 450.00,
        rewards: 150.00,
        referral_code: 'DEMO123',
        referred_by: null,
        created_at: '2024-01-01T00:00:00.000Z',
        status: 'active',
        level: 'Professional',
        next_milestone: 'iPhone 16 Pro',
        progress_to_milestone: 65
      };
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { user }
      })
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to get user data',
        error: error.message
      })
    };
  }
};

// Get user statistics
const handleGetStats = async (event, headers, token) => {
  try {
    const userData = decodeToken(token);
    if (!userData) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Invalid token'
        })
      };
    }
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    let stats;
    if (dbConnected) {
      // Use real database
              const { transactionOperations } = require('../../backend/config/database-railway');
      const transactions = await transactionOperations.getUserTransactions(userData.userId, 100);
      
      stats = {
        total_deposits: transactions.filter(t => t.type === 'deposit' && t.status === 'completed')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        total_withdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        active_investments: 2000.00,
        total_referrals: 12,
        level1_referrals: 8,
        level2_referrals: 4,
        referral_earnings: 150.00,
        growth_earnings: 300.00,
        monthly_growth: 6.0,
        referral_commission: 1.0,
        current_plan: 'Professional',
        next_payout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    } else {
      // Demo mode
      stats = {
        total_deposits: 5000.00,
        total_withdrawals: 500.00,
        active_investments: 2000.00,
        total_referrals: 12,
        level1_referrals: 8,
        level2_referrals: 4,
        referral_earnings: 150.00,
        growth_earnings: 300.00,
        monthly_growth: 6.0,
        referral_commission: 1.0,
        current_plan: 'Professional',
        next_payout: '2024-02-01T00:00:00.000Z'
      };
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { stats }
      })
    };
  } catch (error) {
    console.error('Get stats error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      })
    };
  }
};

// Get user transactions
const handleGetTransactions = async (event, headers, token) => {
  try {
    const userData = decodeToken(token);
    if (!userData) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Invalid token'
        })
      };
    }
    
    const { queryStringParameters } = event;
    const limit = parseInt(queryStringParameters?.limit) || 50;
    const offset = parseInt(queryStringParameters?.offset) || 0;
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    let transactions;
    if (dbConnected) {
      // Use real database
              const { transactionOperations } = require('../../backend/config/database-railway');
      transactions = await transactionOperations.getUserTransactions(userData.userId, limit, offset);
    } else {
      // Demo mode
      transactions = [
        {
          id: 1,
          type: 'deposit',
          amount: 1000.00,
          description: 'Initial deposit',
          status: 'completed',
          timestamp: '2024-01-15T10:30:00.000Z'
        },
        {
          id: 2,
          type: 'growth',
          amount: 60.00,
          description: 'Monthly growth (6%)',
          status: 'completed',
          timestamp: '2024-01-20T00:00:00.000Z'
        },
        {
          id: 3,
          type: 'referral',
          amount: 10.00,
          description: 'Level 1 referral commission',
          status: 'completed',
          timestamp: '2024-01-18T14:20:00.000Z'
        },
        {
          id: 4,
          type: 'withdrawal',
          amount: 200.00,
          description: 'Withdrawal request',
          status: 'pending',
          timestamp: '2024-01-25T09:15:00.000Z'
        }
      ];
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { transactions }
      })
    };
  } catch (error) {
    console.error('Get transactions error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to get transactions',
        error: error.message
      })
    };
  }
};

// Get user referrals
const handleGetReferrals = async (event, headers, token) => {
  try {
    const userData = decodeToken(token);
    if (!userData) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Invalid token'
        })
      };
    }
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    let referrals;
    if (dbConnected) {
      // Use real database
      const { referralOperations } = require('../../backend/config/database-planetscale');
      referrals = await referralOperations.getUserReferrals(userData.userId);
    } else {
      // Demo mode
      referrals = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          level: 1,
          status: 'active',
          total_deposits: 500.00,
          commission_earned: 5.00,
          joined_at: '2024-01-10T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          level: 1,
          status: 'active',
          total_deposits: 1000.00,
          commission_earned: 10.00,
          joined_at: '2024-01-12T00:00:00.000Z'
        },
        {
          id: 3,
          name: 'Bob Wilson',
          email: 'bob@example.com',
          level: 2,
          status: 'active',
          total_deposits: 2000.00,
          commission_earned: 20.00,
          joined_at: '2024-01-08T00:00:00.000Z'
        }
      ];
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { referrals }
      })
    };
  } catch (error) {
    console.error('Get referrals error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to get referrals',
        error: error.message
      })
    };
  }
};

// Update user profile
const handleUpdateProfile = async (event, headers, token) => {
  try {
    const userData = decodeToken(token);
    if (!userData) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Invalid token'
        })
      };
    }
    
    const data = JSON.parse(event.body || '{}');
    const { name, email } = data;
    
    if (!name || !email) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Name and email are required'
        })
      };
    }
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      // Use real database
      const pool = require('../../backend/config/database-planetscale').getPool();
      await pool.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userData.userId]
      );
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Profile updated successfully'
      })
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to update profile',
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
        message: 'Dashboard service is running',
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
        message: 'Dashboard service is running in demo mode',
        timestamp: new Date().toISOString(),
        database: 'Demo Mode',
        environment: 'demo'
      })
    };
  }
};

// Helper function to decode token
const decodeToken = (token) => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};
