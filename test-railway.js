// Test Railway database connection
const mysql = require('mysql2/promise');

async function testRailwayConnection() {
  console.log('🚂 Testing Railway database connection...\n');
  
  // Railway connection details from your dashboard
  const config = {
    host: 'switchback.proxy.rlwy.net',
    user: 'root',
    password: 'your-railway-password', // Replace with your actual password
    database: 'railway',
    port: 28780,
    ssl: {
      rejectUnauthorized: false
    },
    charset: 'utf8mb4',
    timezone: 'Z'
  };
  
  try {
    console.log('🔌 Connecting to Railway database...');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}\n`);
    
    // Create connection
    const connection = await mysql.createConnection(config);
    console.log('✅ Railway database connection successful!\n');
    
    // Test basic query
    console.log('🧪 Testing basic query...');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query test successful:', rows[0]);
    
    // Test database info
    console.log('\n📊 Database information:');
    const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as mysql_version');
    console.log(`   Current Database: ${dbInfo[0].current_db}`);
    console.log(`   MySQL Version: ${dbInfo[0].mysql_version}`);
    
    // Close connection
    await connection.end();
    console.log('\n🎉 Railway database test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Replace "your-railway-password" with your actual password');
    console.log('2. Update Netlify environment variables with these credentials');
    console.log('3. Deploy your application to Netlify');
    console.log('4. Test the complete application with real database');
    
  } catch (error) {
    console.error('❌ Railway connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔑 Authentication failed. Please check:');
      console.log('   - Username: root');
      console.log('   - Password: Make sure you copied the correct password from Railway');
      console.log('   - Database: railway');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 Host not found. Please check:');
      console.log('   - Host: switchback.proxy.rlwy.net');
      console.log('   - Port: 28780');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔌 Connection refused. Please check:');
      console.log('   - Railway database is running');
      console.log('   - Port 28780 is correct');
      console.log('   - Network connection is working');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify your Railway database is active');
    console.log('2. Check your Railway dashboard for correct credentials');
    console.log('3. Ensure your IP is whitelisted (if required)');
    console.log('4. Try connecting from Railway CLI: railway connect MySQL');
  }
}

// Run test
testRailwayConnection();
