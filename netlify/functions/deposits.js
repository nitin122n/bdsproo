// Deposits and withdrawals functions for BDS PRO
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
    
    if (path.includes('/deposit') && httpMethod === 'POST') {
      return handleDeposit(event, headers);
    } else if (path.includes('/withdraw') && httpMethod === 'POST') {
      return handleWithdraw(event, headers);
    } else if (path.includes('/history') && httpMethod === 'GET') {
      return handleGetHistory(event, headers);
    } else if (path.includes('/balance') && httpMethod === 'GET') {
      return handleGetBalance(event, headers);
    }
    
    return {
      statusCode: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Deposits endpoint not found' })
    };
  } catch (error) {
    console.error('Deposits Error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: 'Internal server error', error: error.message })
    };
  }
};

// Handle deposit
const handleDeposit = async (event, headers) => {
  try {
    const data = JSON.parse(event.body || '{}');
    const { amount, payment_method, referral_code } = data;
    const token = event.headers?.authorization?.replace('Bearer ', '') || event.queryStringParameters?.token;
    
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
    
    // Create deposit record
    const deposit = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: parseFloat(amount),
      payment_method: payment_method || 'USDT',
      status: 'pending',
      referral_code: referral_code || null,
      created_at: new Date().toISOString(),
      processed_at: null
    };
    
    // In demo mode, simulate successful deposit
    setTimeout(() => {
      deposit.status = 'completed';
      deposit.processed_at = new Date().toISOString();
      console.log('Deposit processed:', deposit);
    }, 2000);
    
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
const handleWithdraw = async (event, headers) => {
  try {
    const data = JSON.parse(event.body || '{}');
    const { amount, wallet_address, payment_method } = data;
    const token = event.headers?.authorization?.replace('Bearer ', '') || event.queryStringParameters?.token;
    
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
    
    // Create withdrawal record
    const withdrawal = {
      id: `with_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: parseFloat(amount),
      net_amount: parseFloat(net_amount),
      admin_fee: parseFloat(admin_fee),
      wallet_address,
      payment_method: payment_method || 'USDT',
      status: 'pending',
      created_at: new Date().toISOString(),
      processed_at: null,
      estimated_completion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
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
const handleGetHistory = async (event, headers) => {
  try {
    const token = event.headers?.authorization?.replace('Bearer ', '') || event.queryStringParameters?.token;
    
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
    
    const history = [
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
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { history }
      })
    };
  } catch (error) {
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
const handleGetBalance = async (event, headers) => {
  try {
    const token = event.headers?.authorization?.replace('Bearer ', '') || event.queryStringParameters?.token;
    
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
    
    const balance = {
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
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { balance }
      })
    };
  } catch (error) {
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
