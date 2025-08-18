const axios = require('axios');

async function testProductionBackend() {
  try {
    console.log('Testing production backend at https://smartwish.onrender.com...');
    
    // Test if the backend is responding
    const response = await axios.get('https://smartwish.onrender.com/health', {
      timeout: 10000
    });
    
    console.log('✅ Production backend is responding');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Production backend error:', error.response.status);
      console.log('Response data:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.log('❌ Production backend timeout - might be starting up');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testProductionBackend();
