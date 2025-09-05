// PlanetScale database configuration for BDS PRO
const mysql = require('mysql2/promise');

// PlanetScale connection configuration
const createPlanetScaleConfig = () => {
  return {
    host: process.env.DB_HOST || 'aws.connect.psdb.cloud',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'bds-pro-db',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    // PlanetScale requires SSL
    ssl: {
      rejectUnauthorized: false
    },
    // Additional PlanetScale optimizations
    charset: 'utf8mb4',
    timezone: 'Z',
    multipleStatements: false, // Disabled for security
    // Connection pooling for PlanetScale
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };
};

// Create connection pool
let pool = null;

const getPool = () => {
  if (!pool) {
    const config = createPlanetScaleConfig();
    pool = mysql.createPool(config);
    console.log('🌍 PlanetScale connection pool created');
  }
  return pool;
};

// Test PlanetScale connection
const testConnection = async () => {
  try {
    const currentPool = getPool();
    const connection = await currentPool.getConnection();
    
    // Test with a simple query
    await connection.execute('SELECT 1 as test');
    connection.release();
    
    console.log('✅ PlanetScale database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ PlanetScale connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔑 Check your PlanetScale credentials in environment variables');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 Check your PlanetScale host URL');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Check your PlanetScale port and network connection');
    }
    
    return false;
  }
};

// Initialize database schema
const initializeSchema = async () => {
  try {
    const currentPool = getPool();
    
    // Read and execute schema file
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../../database/planetscale-schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await currentPool.execute(statement);
        }
      }
      
      console.log('✅ Database schema initialized successfully');
      return true;
    } else {
      console.log('⚠️ Schema file not found, skipping initialization');
      return false;
    }
  } catch (error) {
    console.error('❌ Schema initialization failed:', error.message);
    return false;
  }
};

// User operations
const userOperations = {
  // Create user
  createUser: async (userData) => {
    const pool = getPool();
    const { id, name, email, password_hash, referral_code, referred_by } = userData;
    
    const query = `
      INSERT INTO users (id, name, email, password_hash, referral_code, referred_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await pool.execute(query, [id, name, email, password_hash, referral_code, referred_by]);
    return userData;
  },
  
  // Get user by email
  getUserByEmail: async (email) => {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },
  
  // Get user by ID
  getUserById: async (id) => {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },
  
  // Update user balance
  updateUserBalance: async (userId, amount, type = 'add') => {
    const pool = getPool();
    const operation = type === 'add' ? '+' : '-';
    const query = `UPDATE users SET account_balance = account_balance ${operation} ? WHERE id = ?`;
    await pool.execute(query, [amount, userId]);
  }
};

// Transaction operations
const transactionOperations = {
  // Create transaction
  createTransaction: async (transactionData) => {
    const pool = getPool();
    const { user_id, type, amount, description, status, related_user_id, reference_id } = transactionData;
    
    const query = `
      INSERT INTO transactions (user_id, type, amount, description, status, related_user_id, reference_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [user_id, type, amount, description, status, related_user_id, reference_id]);
    return { ...transactionData, id: result.insertId };
  },
  
  // Get user transactions
  getUserTransactions: async (userId, limit = 50, offset = 0) => {
    const pool = getPool();
    const query = `
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(query, [userId, limit, offset]);
    return rows;
  }
};

// Referral operations
const referralOperations = {
  // Create referral relationship
  createReferral: async (referrerId, referredId, level = 1) => {
    const pool = getPool();
    const query = `
      INSERT INTO referrals (referrer_id, referred_id, level)
      VALUES (?, ?, ?)
    `;
    await pool.execute(query, [referrerId, referredId, level]);
  },
  
  // Get user referrals
  getUserReferrals: async (userId) => {
    const pool = getPool();
    const query = `
      SELECT r.*, u.name as referred_name, u.email as referred_email
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }
};

module.exports = {
  getPool,
  testConnection,
  initializeSchema,
  userOperations,
  transactionOperations,
  referralOperations,
  // Export pool for backward compatibility
  get pool() { return getPool(); },
  get db() { return getPool(); }
};
