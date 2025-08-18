// Test script to debug admin login
// Run with: node test-admin-login.js

const fetch = require('node-fetch');

async function testAdminLogin() {
  console.log('🔍 Testing Admin Login Debug...\n');
  
  try {
    // Test admin login with the credentials we know exist
    const loginData = {
      email: 'admin@smartwish.com',
      password: 'admin123'
    };
    
    console.log('📤 Sending login request...');
    console.log('Data:', loginData);
    
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n✅ Login successful!');
      console.log('Token:', data.access_token ? 'Present' : 'Missing');
      console.log('User:', data.user ? 'Present' : 'Missing');
    } else {
      console.log('\n❌ Login failed');
      console.log('Error details:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testAdminLogin();
