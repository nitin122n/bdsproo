// Database setup function for Netlify
const { testConnection, initializeSchema } = require('../../backend/config/database-planetscale');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Setting up database...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: 'Database not configured. Running in demo mode.',
          database: 'Demo Mode'
        })
      };
    }

    // Initialize schema
    const schemaInitialized = await initializeSchema();
    
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Database setup completed successfully!',
        database: 'Connected',
        schema: schemaInitialized ? 'Initialized' : 'Already exists'
      })
    };

  } catch (error) {
    console.error('Database setup error:', error);
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Database setup failed, running in demo mode',
        error: error.message,
        database: 'Demo Mode'
      })
    };
  }
};
