// Test script for Supabase integration
// Run with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  console.log('Testing Supabase connection...');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Not set');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not found in environment variables');
    console.log('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by querying the saved_designs table
    const { data, error } = await supabase
      .from('saved_designs')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('Make sure:');
      console.log('1. Your Supabase project is active');
      console.log('2. The saved_designs table exists (run the migration)');
      console.log('3. Your credentials are correct');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Database is ready for use.');
    }
  } catch (error) {
    console.log('❌ Error testing Supabase connection:', error.message);
  }
}

// Load environment variables
require('dotenv').config();

// Run the test
testSupabaseConnection();
