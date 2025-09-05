const mysql = require('mysql2/promise');
require('dotenv').config();

// Detect if we're running in a cloud environment
const isCloudEnvironment = process.env.NODE_ENV === 'production' || 
                          process.env.NETLIFY === 'true' || 
                          process.env.VERCEL === 'true' ||
                          process.env.RAILWAY_ENVIRONMENT === 'production';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bds_pro_db',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: isCloudEnvironment ? 5 : 10, // Lower limit for cloud
    queueLimit: 0,
    multipleStatements: true,
    // SSL configuration for cloud databases
    ssl: isCloudEnvironment ? {
        rejectUnauthorized: false
    } : false,
    // Connection timeout for cloud databases
    acquireTimeout: isCloudEnvironment ? 60000 : 10000,
    timeout: isCloudEnvironment ? 60000 : 10000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.warn('⚠️ Database connection failed:', error.message);
        console.log('🔄 Starting in temporary demo mode - please configure MySQL for production');
        console.log('📋 To fix: 1) Start XAMPP MySQL 2) Check phpMyAdmin 3) Update DB_PASSWORD if needed');
        return false; // Allow server to start in demo mode temporarily
    }
};

module.exports = {
    pool,
    db: pool, // Export as db for controllers
    testConnection
};

