// Dashboard functions for BDS PRO
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
    
    if (path.includes('/user') && httpMethod === 'GET') {
      return handleGetUser(event, headers);
    } else if (path.includes('/stats') && httpMethod === 'GET') {
      return handleGetStats(event, headers);
    } else if (path.includes('/transactions') && httpMethod === 'GET') {
      return handleGetTransactions(event, headers);
    } else if (path.includes('/referrals') && httpMethod === 'GET') {
      return handleGetReferrals(event, headers);
    }
    
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Dashboard endpoint not found' })
    };
  } catch (error) {
    console.error('Dashboard Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Internal server error', error: error.message })
    };
  }
};

// Get user data
const handleGetUser = async (event, headers) => {
  try {
    const token = event.queryStringParameters?.token || event.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Authentication token required'
        })
      };
    }
    
    // In demo mode, create mock user data
    const user = {
      id: 'demo_user_123',
      name: 'Demo User',
      email: 'demo@bdspro.io',
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
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { user }
      })
    };
  } catch (error) {
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
const handleGetStats = async (event, headers) => {
  try {
    const token = event.queryStringParameters?.token || event.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Authentication token required'
        })
      };
    }
    
    const stats = {
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
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { stats }
      })
    };
  } catch (error) {
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
const handleGetTransactions = async (event, headers) => {
  try {
    const token = event.queryStringParameters?.token || event.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Authentication token required'
        })
      };
    }
    
    const transactions = [
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
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { transactions }
      })
    };
  } catch (error) {
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
const handleGetReferrals = async (event, headers) => {
  try {
    const token = event.queryStringParameters?.token || event.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return {
        statusCode: 401,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Authentication token required'
        })
      };
    }
    
    const referrals = [
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
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { referrals }
      })
    };
  } catch (error) {
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
