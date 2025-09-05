// Railway setup script for BDS PRO
const { testConnection, initializeSchema } = require('../backend/config/database-railway');
require('dotenv').config();

async function setupRailway() {
  console.log('🚂 Setting up Railway database for BDS PRO...\n');
  
  // Check environment variables
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.log('\n📋 Please set these variables in your .env file or Netlify dashboard:');
    console.log('   DB_HOST=containers-us-west-xxx.railway.app');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=your-railway-password');
    console.log('   DB_NAME=railway');
    console.log('   DB_PORT=3306');
    process.exit(1);
  }
  
  console.log('✅ Environment variables configured');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}\n`);
  
  // Test connection
  console.log('🔌 Testing Railway database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('❌ Failed to connect to Railway database');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your Railway credentials');
    console.log('2. Check if your database is active in Railway dashboard');
    console.log('3. Ensure your IP is whitelisted (if required)');
    console.log('4. Verify the connection string format');
    process.exit(1);
  }
  
  console.log('✅ Railway database connection successful\n');
  
  // Initialize schema
  console.log('📊 Initializing Railway database schema...');
  const schemaInitialized = await initializeSchema();
  
  if (schemaInitialized) {
    console.log('✅ Railway database schema initialized successfully\n');
  } else {
    console.log('⚠️ Schema initialization skipped (file not found)\n');
  }
  
  // Test basic operations
  console.log('🧪 Testing basic Railway database operations...');
  try {
    const { userOperations } = require('../backend/config/database-railway');
    
    // Test user creation
    const testUser = {
      id: 'test_user_' + Date.now(),
      name: 'Test User',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      referral_code: 'TEST123',
      referred_by: null
    };
    
    await userOperations.createUser(testUser);
    console.log('✅ User creation test passed');
    
    // Test user retrieval
    const retrievedUser = await userOperations.getUserByEmail(testUser.email);
    if (retrievedUser) {
      console.log('✅ User retrieval test passed');
    }
    
    // Clean up test user
    const pool = require('../backend/config/database-railway').getPool();
    await pool.execute('DELETE FROM users WHERE id = ?', [testUser.id]);
    console.log('✅ Test cleanup completed');
    
  } catch (error) {
    console.error('❌ Railway database operations test failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 Railway setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your Netlify environment variables with Railway credentials');
  console.log('2. Deploy your application to Netlify');
  console.log('3. Test the complete application with real database');
  console.log('\n🔗 Useful Railway links:');
  console.log('- Dashboard: https://railway.app');
  console.log('- Documentation: https://docs.railway.app');
  console.log('- Discord: https://discord.gg/railway');
}

// Run setup
if (require.main === module) {
  setupRailway().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupRailway };
