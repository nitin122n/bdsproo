#!/usr/bin/env node

/**
 * MySQL Deployment Script for Railway
 * This script helps you deploy your database schema to Railway MySQL
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying MySQL Database to Railway...');

// Read environment variables
require('dotenv').config();

const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

async function deployDatabase() {
    let connection;
    
    try {
        console.log('📊 Connecting to Railway MySQL...');
        console.log(`   Host: ${dbConfig.host}`);
        console.log(`   Port: ${dbConfig.port}`);
        console.log(`   Database: ${dbConfig.database}`);
        console.log(`   User: ${dbConfig.user}`);
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to Railway MySQL successfully!');
        
        // Read schema file
        const schemaPath = path.join(__dirname, '..', 'backend', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📋 Executing database schema...');
        
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('✅ Executed statement successfully');
                } catch (error) {
                    if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                        error.code === 'ER_DUP_KEYNAME' ||
                        error.message.includes('already exists')) {
                        console.log('⚠️  Table/Key already exists, skipping...');
                    } else {
                        console.error('❌ Error executing statement:', error.message);
                    }
                }
            }
        }
        
        console.log('🎉 Database deployment completed successfully!');
        console.log('📊 Your BDS PRO database is now ready on Railway!');
        
    } catch (error) {
        console.error('❌ Database deployment failed:', error.message);
        console.log('🔧 Troubleshooting:');
        console.log('   1. Check your Railway MySQL credentials');
        console.log('   2. Ensure the database service is running');
        console.log('   3. Verify your environment variables');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Check if required environment variables are set
const requiredVars = ['MYSQLHOST', 'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE'];
const missingVars = requiredVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(envVar => console.log(`   - ${envVar}`));
    console.log('📝 Please set these in your .env file or Railway dashboard');
    process.exit(1);
}

deployDatabase();
