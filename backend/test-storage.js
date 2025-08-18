const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Setup...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Check:');
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('\n❌ Missing environment variables. Please check your .env file.');
    return;
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Test 1: Check if bucket exists
    console.log('\n🔍 Testing bucket access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Error listing buckets:', bucketError.message);
      return;
    }

    const smartwishBucket = buckets.find(bucket => bucket.name === 'smartwish-assets');
    
    if (!smartwishBucket) {
      console.log('❌ Bucket "smartwish-assets" not found!');
      console.log('📋 Available buckets:', buckets.map(b => b.name));
      console.log('\n💡 Please create the bucket in Supabase Dashboard:');
      console.log('   1. Go to Storage in Supabase Dashboard');
      console.log('   2. Click "Create a new bucket"');
      console.log('   3. Name it "smartwish-assets"');
      console.log('   4. Check "Public bucket"');
      return;
    }

    console.log('✅ Bucket "smartwish-assets" found!');
    console.log(`   Public: ${smartwishBucket.public ? '✅ Yes' : '❌ No'}`);

    // Test 2: Try to upload a test image
    console.log('\n📤 Testing image upload...');
    const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const testPath = 'test/hello.png';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('smartwish-assets')
      .upload(testPath, testImage, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      console.log('\n💡 This might be due to missing storage policies.');
      console.log('   Please run the SQL policies from the setup guide.');
      return;
    }

    console.log('✅ Test upload successful!');

    // Test 3: Get public URL
    console.log('\n🔗 Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from('smartwish-assets')
      .getPublicUrl(testPath);

    console.log('✅ Public URL generated:', urlData.publicUrl);

    // Test 4: Try to access the URL
    console.log('\n🌐 Testing URL accessibility...');
    try {
      const response = await fetch(urlData.publicUrl);
      if (response.ok) {
        console.log('✅ Image accessible via public URL!');
      } else {
        console.log('❌ Image not accessible:', response.status);
      }
    } catch (error) {
      console.log('❌ Error accessing URL:', error.message);
    }

    // Clean up: Delete test file
    console.log('\n🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('smartwish-assets')
      .remove([testPath]);

    if (deleteError) {
      console.log('⚠️ Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file deleted successfully!');
    }

    console.log('\n🎉 Supabase Storage is properly configured!');
    console.log('✅ You can now save card images to the cloud.');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testSupabaseStorage();

