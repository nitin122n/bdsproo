// Deposits and withdrawals serverless function for BDS PRO
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
    
    console.log(`Deposits function called: ${httpMethod} ${path}, action: ${action}`);
    
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
      case 'deposit':
        if (httpMethod === 'POST') {
          return await handleDeposit(event, headers, token);
        }
        break;
        
      case 'withdraw':
        if (httpMethod === 'POST') {
          return await handleWithdraw(event, headers, token);
        }
        break;
        
      case 'history':
        if (httpMethod === 'GET') {
          return await handleGetHistory(event, headers, token);
        }
        break;
        
      case 'balance':
        if (httpMethod === 'GET') {
          return await handleGetBalance(event, headers, token);
        }
        break;
        
      case 'plans':
        if (httpMethod === 'GET') {
          return await handleGetPlans(event, headers);
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
            message: 'Deposits endpoint not found',
            availableEndpoints: ['deposit', 'withdraw', 'history', 'balance', 'plans', 'health']
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
    console.error('Deposits function error:', error);
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

// Handle deposit
const handleDeposit = async (event, headers, token) => {
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
    const { amount, payment_method, referral_code } = data;
    
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Valid amount is required'
        })
      };
    }
    
    if (amount < 50) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Minimum deposit amount is 50 USDT'
        })
      };
    }
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    const deposit = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userData.userId,
      amount: parseFloat(amount),
      payment_method: payment_method || 'USDT',
      status: 'pending',
      referral_code: referral_code || null,
      created_at: new Date().toISOString(),
      processed_at: null
    };
    
    if (dbConnected) {
      // Use real database
      const { transactionOperations, userOperations } = require('../../backend/config/database-planetscale');
      
      // Create transaction record
      await transactionOperations.createTransaction({
        user_id: userData.userId,
        type: 'deposit',
        amount: deposit.amount,
        description: `Deposit via ${deposit.payment_method}`,
        status: 'pending',
        reference_id: deposit.id
      });
      
      // In production, process payment here
      // For demo, mark as completed after 2 seconds
      setTimeout(async () => {
        try {
          await transactionOperations.createTransaction({
            user_id: userData.userId,
            type: 'deposit',
            amount: deposit.amount,
            description: `Deposit via ${deposit.payment_method}`,
            status: 'completed',
            reference_id: deposit.id
          });
          
          // Update user balance
          await userOperations.updateUserBalance(userData.userId, deposit.amount, 'add');
          
          console.log('Deposit processed:', deposit.id);
        } catch (error) {
          console.error('Deposit processing error:', error);
        }
      }, 2000);
    } else {
      // Demo mode - simulate processing
      setTimeout(() => {
        deposit.status = 'completed';
        deposit.processed_at = new Date().toISOString();
        console.log('Demo deposit processed:', deposit);
      }, 2000);
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Deposit request submitted successfully!',
        data: { deposit }
      })
    };
  } catch (error) {
    console.error('Deposit error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Deposit failed',
        error: error.message
      })
    };
  }
};

// Handle withdrawal
const handleWithdraw = async (event, headers, token) => {
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
    const { amount, wallet_address, payment_method } = data;
    
    if (!amount || amount <= 0) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Valid amount is required'
        })
      };
    }
    
    if (amount < 10) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Minimum withdrawal amount is 10 USDT'
        })
      };
    }
    
    if (!wallet_address) {
      return {
        statusCode: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Wallet address is required'
        })
      };
    }
    
    // Calculate admin fee (2%)
    const admin_fee = amount * 0.02;
    const net_amount = amount - admin_fee;
    
    const withdrawal = {
      id: `with_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userData.userId,
      amount: parseFloat(amount),
      net_amount: parseFloat(net_amount),
      admin_fee: parseFloat(admin_fee),
      wallet_address,
      payment_method: payment_method || 'USDT',
      status: 'pending',
      created_at: new Date().toISOString(),
      processed_at: null,
      estimated_completion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      // Use real database
      const { transactionOperations } = require('../../backend/config/database-planetscale');
      
      // Create withdrawal transaction
      await transactionOperations.createTransaction({
        user_id: userData.userId,
        type: 'withdrawal',
        amount: withdrawal.amount,
        description: `Withdrawal to ${wallet_address}`,
        status: 'pending',
        reference_id: withdrawal.id
      });
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Withdrawal request submitted successfully!',
        data: { withdrawal }
      })
    };
  } catch (error) {
    console.error('Withdrawal error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Withdrawal failed',
        error: error.message
      })
    };
  }
};

// Get transaction history
const handleGetHistory = async (event, headers, token) => {
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
    const type = queryStringParameters?.type; // Filter by transaction type
    
    // Check if database is available
    const dbConnected = await testConnection();
    
    let history;
    if (dbConnected) {
      // Use real database
      const { transactionOperations } = require('../../backend/config/database-planetscale');
      history = await transactionOperations.getUserTransactions(userData.userId, limit, offset);
      
      // Filter by type if specified
      if (type) {
        history = history.filter(t => t.type === type);
      }
    } else {
      // Demo mode
      history = [
        {
          id: 1,
          type: 'deposit',
          amount: 1000.00,
          status: 'completed',
          description: 'USDT Deposit',
          timestamp: '2024-01-15T10:30:00.000Z'
        },
        {
          id: 2,
          type: 'withdrawal',
          amount: 200.00,
          status: 'completed',
          description: 'USDT Withdrawal',
          timestamp: '2024-01-20T14:20:00.000Z'
        },
        {
          id: 3,
          type: 'growth',
          amount: 60.00,
          status: 'completed',
          description: 'Monthly Growth (6%)',
          timestamp: '2024-01-25T00:00:00.000Z'
        },
        {
          id: 4,
          type: 'referral',
          amount: 10.00,
          status: 'completed',
          description: 'Referral Commission',
          timestamp: '2024-01-22T09:15:00.000Z'
        },
        {
          id: 5,
          type: 'withdrawal',
          amount: 500.00,
          status: 'pending',
          description: 'USDT Withdrawal',
          timestamp: '2024-01-28T16:45:00.000Z'
        }
      ];
      
      // Filter by type if specified
      if (type) {
        history = history.filter(t => t.type === type);
      }
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { history }
      })
    };
  } catch (error) {
    console.error('Get history error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to get transaction history',
        error: error.message
      })
    };
  }
};

// Get account balance
const handleGetBalance = async (event, headers, token) => {
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
    
    let balance;
    if (dbConnected) {
      // Use real database
      const { userOperations } = require('../../backend/config/database-planetscale');
      const user = await userOperations.getUserById(userData.userId);
      
      balance = {
        account_balance: user.account_balance || 0,
        available_balance: (user.account_balance || 0) * 0.8, // 80% available
        locked_balance: (user.account_balance || 0) * 0.2, // 20% locked
        total_earnings: user.total_earning || 0,
        referral_earnings: user.rewards || 0,
        growth_earnings: (user.total_earning || 0) - (user.rewards || 0),
        pending_deposits: 0.00,
        pending_withdrawals: 0.00,
        currency: 'USDT'
      };
    } else {
      // Demo mode
      balance = {
        account_balance: 2500.00,
        available_balance: 2000.00,
        locked_balance: 500.00,
        total_earnings: 450.00,
        referral_earnings: 150.00,
        growth_earnings: 300.00,
        pending_deposits: 0.00,
        pending_withdrawals: 500.00,
        currency: 'USDT'
      };
    }
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { balance }
      })
    };
  } catch (error) {
    console.error('Get balance error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to get balance',
        error: error.message
      })
    };
  }
};

// Get investment plans
const handleGetPlans = async (event, headers) => {
  try {
    const plans = [
      {
        id: 1,
        name: 'Starter',
        min_amount: 50.00,
        max_amount: 499.99,
        growth_rate: 6.00,
        referral_rate: 1.00,
        duration_days: 30,
        description: 'Perfect for beginners'
      },
      {
        id: 2,
        name: 'Professional',
        min_amount: 500.00,
        max_amount: 4999.99,
        growth_rate: 6.00,
        referral_rate: 1.00,
        duration_days: 30,
        description: 'For serious investors'
      },
      {
        id: 3,
        name: 'Premium',
        min_amount: 5000.00,
        max_amount: null,
        growth_rate: 6.00,
        referral_rate: 1.00,
        duration_days: 30,
        description: 'Maximum returns'
      }
    ];
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { plans }
      })
    };
  } catch (error) {
    console.error('Get plans error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Failed to get investment plans',
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
        message: 'Deposits service is running',
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
        message: 'Deposits service is running in demo mode',
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
