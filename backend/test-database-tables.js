// Test script to check database tables and users table
// Run with: node test-database-tables.js

const { createClient } = require('@supabase/supabase-js');

async function testDatabaseTables() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for table inspection
  
  console.log('Testing Supabase database tables...');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Not set');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not found in environment variables');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\n🔍 Checking available tables...');
    
    // Test if users table exists
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (usersError) {
        console.log('❌ Users table test failed:', usersError.message);
        console.log('   This suggests the users table does not exist or has permission issues');
      } else {
        console.log('✅ Users table exists and is accessible');
        
        // Try to get actual user count
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.log('⚠️ Could not get user count:', countError.message);
        } else {
          console.log(`📊 Users table has ${count} records`);
        }
      }
    } catch (error) {
      console.log('❌ Error testing users table:', error.message);
    }
    
    // Test if saved_designs table exists
    try {
      const { data: designsData, error: designsError } = await supabase
        .from('saved_designs')
        .select('count')
        .limit(1);
      
      if (designsError) {
        console.log('❌ Saved_designs table test failed:', designsError.message);
      } else {
        console.log('✅ Saved_designs table exists and is accessible');
      }
    } catch (error) {
      console.log('❌ Error testing saved_designs table:', error.message);
    }
    
    // Test if audit_logs table exists
    try {
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('count')
        .limit(1);
      
      if (auditError) {
        console.log('❌ Audit_logs table test failed:', auditError.message);
      } else {
        console.log('✅ Audit_logs table exists and is accessible');
      }
    } catch (error) {
      console.log('❌ Error testing audit_logs table:', error.message);
    }
    
    // Try to get table list using raw SQL (if possible)
    console.log('\n🔍 Attempting to list all tables...');
    try {
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_table_list'); // This won't work unless you create this function
      
      if (tablesError) {
        console.log('⚠️ Could not list tables using RPC (this is normal)');
        console.log('   Error:', tablesError.message);
      } else {
        console.log('📋 Available tables:', tablesData);
      }
    } catch (error) {
      console.log('⚠️ Could not list tables (this is normal)');
    }
    
    console.log('\n📝 Summary:');
    console.log('- If you see ❌ for users table, you need to run the database migration');
    console.log('- If you see ✅ for users table, the table exists but might be empty');
    console.log('- Check your Supabase dashboard to see what tables actually exist');
    
  } catch (error) {
    console.log('❌ Error testing database:', error.message);
  }
}

// Load environment variables
require('dotenv').config();

// Run the test
testDatabaseTables();
