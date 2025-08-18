// Test script to verify authentication endpoints
// Run with: node test-auth-endpoints.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3001'; // Backend runs on port 3001

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    try {
      const response = await axios.get(`${BASE_URL}/`);
      console.log('✅ Server is running');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('   Error:', error.message);
      console.log('   Make sure to run: npm run start:dev');
      return;
    }
    
    // Test 2: Test login with default admin account
    console.log('\n2️⃣ Testing admin login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@smartwish.com',
        password: 'admin123'
      });
      
      console.log('✅ Admin login successful!');
      console.log('   Token received:', loginResponse.data.access_token ? 'Yes' : 'No');
      console.log('   User data:', {
        id: loginResponse.data.user?.id,
        email: loginResponse.data.user?.email,
        name: loginResponse.data.user?.name,
        role: loginResponse.data.user?.role
      });
      
      const token = loginResponse.data.access_token;
      
      // Test 3: Test protected endpoint with token
      console.log('\n3️⃣ Testing protected endpoint...');
      try {
        const protectedResponse = await axios.get(`${BASE_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Protected endpoint accessible with token');
        console.log('   User profile:', protectedResponse.data);
      } catch (error) {
        console.log('❌ Protected endpoint failed');
        console.log('   Error:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.log('❌ Admin login failed');
      console.log('   Error:', error.response?.data || error.message);
    }
    
    // Test 4: Test user registration
    console.log('\n4️⃣ Testing user registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/signup`, {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      });
      
      console.log('✅ User registration successful!');
      console.log('   New user created:', registerResponse.data);
    } catch (error) {
      console.log('❌ User registration failed');
      console.log('   Error:', error.response?.data || error.message);
    }
    
    // Test 5: Test login with new user
    console.log('\n5️⃣ Testing new user login...');
    try {
      const newUserLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      console.log('✅ New user login successful!');
      console.log('   Token received:', newUserLoginResponse.data.access_token ? 'Yes' : 'No');
    } catch (error) {
      console.log('❌ New user login failed');
      console.log('   Error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n📝 Test Summary:');
  console.log('- If all tests pass (✅), your authentication system is working perfectly!');
  console.log('- If any test fails (❌), check the error messages above');
  console.log('- Make sure your backend server is running on the correct port');
}

// Run the test
testAuthEndpoints();
