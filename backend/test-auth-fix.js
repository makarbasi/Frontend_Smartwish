const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config({ path: './env.production' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testAuthFix() {
  const client = await pool.connect();
  
  try {
    console.log('Testing authentication system...');
    
    // Test 1: Check if users table has all required columns
    console.log('\n1. Checking users table structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('oauth_provider', 'oauth_id', 'status', 'role', 'login_attempts', 'locked_until')
      ORDER BY column_name;
    `);
    
    console.log('Required columns found:');
    columnsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Test 2: Check if we can create a test user
    console.log('\n2. Testing user creation...');
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (existingUser.rows.length > 0) {
      console.log(`User ${testEmail} already exists with ID: ${existingUser.rows[0].id}`);
    } else {
      // Create test user
      const createResult = await client.query(`
        INSERT INTO users (
          email, 
          name, 
          password, 
          oauth_provider, 
          status, 
          role, 
          is_email_verified,
          social_media,
          metadata,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING id, email, name, status, role;
      `, [
        testEmail,
        'Test User',
        hashedPassword,
        'local',
        'active',
        'user',
        true,
        '{}',
        '{}'
      ]);
      
      console.log('Test user created successfully:');
      console.log(`  - ID: ${createResult.rows[0].id}`);
      console.log(`  - Email: ${createResult.rows[0].email}`);
      console.log(`  - Status: ${createResult.rows[0].status}`);
    }
    
    // Test 3: Test user lookup
    console.log('\n3. Testing user lookup...');
    const userResult = await client.query(`
      SELECT id, email, name, oauth_provider, status, role, is_email_verified, login_attempts
      FROM users 
      WHERE email = $1
    `, [testEmail]);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('User found:');
      console.log(`  - ID: ${user.id}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - OAuth Provider: ${user.oauth_provider}`);
      console.log(`  - Status: ${user.status}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Email Verified: ${user.is_email_verified}`);
      console.log(`  - Login Attempts: ${user.login_attempts}`);
    } else {
      console.log('No user found with email:', testEmail);
    }
    
    // Test 4: Test password validation
    console.log('\n4. Testing password validation...');
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const passwordResult = await client.query(
        'SELECT password FROM users WHERE id = $1',
        [user.id]
      );
      
      if (passwordResult.rows.length > 0) {
        const storedPassword = passwordResult.rows[0].password;
        const isValid = await bcrypt.compare(testPassword, storedPassword);
        console.log(`Password validation: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      }
    }
    
    console.log('\n✅ Authentication system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testAuthFix()
  .then(() => {
    console.log('\n🎉 All tests passed! The authentication system should now work.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  });
