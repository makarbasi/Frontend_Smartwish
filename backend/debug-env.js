require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('GOOGLE_REDIRECT_URL:', process.env.GOOGLE_REDIRECT_URL);
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
console.log('PRODUCTION_URL:', process.env.PRODUCTION_URL);
console.log('Current working directory:', process.cwd());
console.log('Environment file loaded from:', require('path').resolve('.env'));

// Simulate the OAuth controller logic
const callbackUrl = process.env.GOOGLE_CALLBACK_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
const errorUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('\n=== OAuth Controller Logic ===');
console.log('callbackUrl:', callbackUrl);
console.log('errorUrl:', errorUrl);
console.log('Error redirect URL:', `${errorUrl}/auth/error?message=Google authentication failed`);

console.log('\n=== Environment File Contents ===');
try {
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log(envContent);
} catch (error) {
  console.error('Error reading .env file:', error.message);
}

console.log('================================');
