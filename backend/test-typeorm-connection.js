// Test script to verify TypeORM connection to Supabase
// Run with: node test-typeorm-connection.js

require('dotenv').config();
const { DataSource } = require('typeorm');
const { databaseConfig } = require('./dist/backend/src/config/database.config');

async function testTypeORMConnection() {
  console.log('🧪 Testing TypeORM connection to Supabase...\n');
  
  console.log('Database Configuration:');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('Database:', process.env.DB_NAME);
  console.log('Username:', process.env.DB_USERNAME);
  console.log('Password:', process.env.DB_PASSWORD ? 'Set' : 'Not set');
  console.log('SSL:', databaseConfig.ssl);
  console.log('');

  try {
    // Create a test data source
    const dataSource = new DataSource({
      ...databaseConfig,
      entities: [], // Don't load entities for connection test
    });

    console.log('🔄 Attempting to connect...');
    
    // Initialize the connection
    await dataSource.initialize();
    
    console.log('✅ Successfully connected to Supabase database!');
    
    // Test if we can query the users table
    console.log('\n🔄 Testing table access...');
    
    const result = await dataSource.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table accessible:', result[0].count, 'users found');
    
    const savedDesignsResult = await dataSource.query('SELECT COUNT(*) as count FROM saved_designs');
    console.log('✅ Saved_designs table accessible:', savedDesignsResult[0].count, 'designs found');
    
    const auditLogsResult = await dataSource.query('SELECT COUNT(*) as count FROM audit_logs');
    console.log('✅ Audit_logs table accessible:', auditLogsResult[0].count, 'logs found');
    
    // Close the connection
    await dataSource.destroy();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 This usually means the database host/port is incorrect');
    } else if (error.code === '28P01') {
      console.log('\n💡 This means the username/password is incorrect');
    } else if (error.code === '3D000') {
      console.log('\n💡 This means the database name is incorrect');
    }
  }
}

testTypeORMConnection();
