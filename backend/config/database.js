const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'bds_pro_db',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    // Railway MySQL specific configurations
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Connected to: ${process.env.MYSQLHOST || process.env.DB_HOST}:${process.env.MYSQLPORT || process.env.DB_PORT}/${process.env.MYSQLDATABASE || process.env.DB_NAME}`);
        connection.release();
        return true;
    } catch (error) {
        console.warn('⚠️ Database connection failed:', error.message);
        if (process.env.NODE_ENV === 'production') {
            console.error('❌ Production database connection failed. Check Railway MySQL credentials.');
            console.log('📋 Railway MySQL Config:');
            console.log(`   Host: ${process.env.MYSQLHOST || process.env.DB_HOST}`);
            console.log(`   Port: ${process.env.MYSQLPORT || process.env.DB_PORT}`);
            console.log(`   Database: ${process.env.MYSQLDATABASE || process.env.DB_NAME}`);
            console.log(`   User: ${process.env.MYSQLUSER || process.env.DB_USER}`);
            return false; // Don't start in production without DB
        } else {
            console.log('🔄 Starting in temporary demo mode - please configure MySQL for production');
            console.log('📋 To fix: 1) Start XAMPP MySQL 2) Check phpMyAdmin 3) Update DB_PASSWORD if needed');
            return false; // Allow server to start in demo mode temporarily
        }
    }
};

module.exports = {
    pool,
    db: pool, // Export as db for controllers
    testConnection
};

