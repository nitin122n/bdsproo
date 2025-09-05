#!/usr/bin/env node

/**
 * Vercel Build Script for BDS PRO
 * This script prepares the project for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Building BDS PRO for Vercel deployment...');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'vercel.json',
  'backend/server.js'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
});

// Check environment variables
console.log('🔧 Checking environment variables...');
const requiredEnvVars = [
  'MYSQLHOST',
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQLDATABASE',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables:', missingVars.join(', '));
  console.log('📝 Please set these in Vercel dashboard');
} else {
  console.log('✅ All required environment variables are set');
}

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, '..', '.next');
if (!fs.existsSync(buildDir)) {
  console.log('📁 Creating build directory...');
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('✅ Build preparation complete!');
console.log('🚀 Ready for Vercel deployment');
console.log('📋 Next steps:');
console.log('   1. Push to GitHub');
console.log('   2. Connect to Vercel');
console.log('   3. Set environment variables');
console.log('   4. Deploy!');
