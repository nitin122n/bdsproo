// Cloud-optimized database configuration for Netlify
const mysql = require('mysql2/promise');

// Cloud database configuration
const createCloudConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true';
  
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bds_pro_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: isProduction ? 3 : 10, // Lower for cloud
    queueLimit: 0,
    acquireTimeout: isProduction ? 30000 : 10000,
    timeout: isProduction ? 30000 : 10000,
    // SSL for cloud databases
    ssl: isProduction ? {
      rejectUnauthorized: false
    } : false,
    // Additional cloud optimizations
    multipleStatements: false, // Disable for security
    charset: 'utf8mb4',
    timezone: 'Z'
  };
};

// Create connection pool
let pool = null;

const getPool = () => {
  if (!pool) {
    const config = createCloudConfig();
    pool = mysql.createPool(config);
  }
  return pool;
};

// Test database connection with better error handling
const testConnection = async () => {
  try {
    const currentPool = getPool();
    const connection = await currentPool.getConnection();
    
    // Test with a simple query
    await connection.execute('SELECT 1 as test');
    connection.release();
    
    console.log('✅ Cloud database connected successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Cloud database connection failed:', error.message);
    
    // Return demo mode configuration
    if (process.env.NETLIFY === 'true') {
      console.log('🔄 Running in Netlify demo mode - configure database for full functionality');
      console.log('📋 To fix: Set up PlanetScale, Railway, or Neon database and update environment variables');
    }
    
    return false;
  }
};

// Demo mode data for when database is not available
const getDemoData = () => {
  return {
    users: [
      {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@bdspro.io',
        account_balance: 1000.00,
        total_earning: 150.00,
        rewards: 50.00
      }
    ],
    transactions: [
      {
        id: 1,
        user_id: 'demo-user-1',
        type: 'deposit',
        amount: 1000.00,
        description: 'Initial deposit',
        timestamp: new Date().toISOString()
      }
    ]
  };
};

module.exports = {
  getPool,
  testConnection,
  getDemoData,
  // Export pool for backward compatibility
  get pool() { return getPool(); },
  get db() { return getPool(); }
};
