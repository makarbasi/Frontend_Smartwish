// Test script to check entity loading and database connection
// Run with: node test-entity-loading.js

require('dotenv').config();
const { createConnection } = require('typeorm');
const { User } = require('./dist/backend/src/user/user.entity');

async function testEntityLoading() {
  try {
    console.log('🔍 Testing User entity loading...');
    
    // Create connection
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432') || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'smartwish',
      entities: [User],
      synchronize: false, // Don't auto-sync in test
      logging: true,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('✅ Database connection successful');
    
    // Test if we can query the users table
    const userRepository = connection.getRepository(User);
    
    // Check table structure
    const tableExists = await connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('📋 Users table exists:', tableExists[0].exists);
    
    // Check if new columns exist
    const newColumns = await connection.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('status', 'role', 'login_attempts', 'locked_until', 'metadata', 'deleted_at')
      ORDER BY column_name;
    `);
    
    console.log('🆕 New columns found:', newColumns.length);
    newColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Test basic query
    const userCount = await userRepository.count();
    console.log(`👥 Total users in database: ${userCount}`);
    
    // Test if we can load a user with new fields
    if (userCount > 0) {
      const sampleUser = await userRepository.findOne({ where: {} });
      console.log('📝 Sample user data:');
      console.log(`   - ID: ${sampleUser.id}`);
      console.log(`   - Email: ${sampleUser.email}`);
      console.log(`   - Status: ${sampleUser.status}`);
      console.log(`   - Role: ${sampleUser.role}`);
      console.log(`   - Login Attempts: ${sampleUser.loginAttempts}`);
      console.log(`   - Locked Until: ${sampleUser.lockedUntil}`);
      console.log(`   - Metadata: ${JSON.stringify(sampleUser.metadata)}`);
    }
    
    // Test the new functions
    console.log('🧪 Testing new database functions...');
    
    try {
      const functionsExist = await connection.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('handle_login_attempt', 'soft_delete_user', 'update_user_status')
        ORDER BY routine_name;
      `);
      
      console.log('🔧 Functions found:', functionsExist.length);
      functionsExist.forEach(func => {
        console.log(`   - ${func.routine_name}`);
      });
      
    } catch (funcError) {
      console.log('⚠️  Function test error:', funcError.message);
    }
    
    await connection.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testEntityLoading();
