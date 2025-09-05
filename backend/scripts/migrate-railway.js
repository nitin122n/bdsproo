#!/usr/bin/env node

/**
 * Railway MySQL Migration Script
 * This script runs the database schema on Railway MySQL
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    multipleStatements: true
};

async function runMigration() {
    let connection;
    
    try {
        console.log('🚀 Starting Railway MySQL migration...');
        console.log(`📊 Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to Railway MySQL');
        
        // Read schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
                } catch (error) {
                    if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                        error.code === 'ER_DUP_KEYNAME' || 
                        error.code === 'ER_DUP_ENTRY') {
                        console.log(`⚠️ Statement ${i + 1} skipped (already exists): ${error.message}`);
                    } else {
                        console.error(`❌ Error in statement ${i + 1}:`, error.message);
                        throw error;
                    }
                }
            }
        }
        
        console.log('🎉 Railway MySQL migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run migration if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
