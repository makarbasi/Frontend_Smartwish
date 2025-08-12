/**
 * Comprehensive Test for All Templates
 * 
 * This file tests that all templates are loaded correctly and the birthday category shows all templates
 */

import dataProvider from './services/dataProvider.js';

async function testAllTemplates() {
  console.log('🧪 Testing All Templates...');
  
  try {
    // Test 1: Get all templates
    console.log('\n📋 Test 1: Getting all templates...');
    const allTemplates = await dataProvider.getTemplates();
    console.log('✅ Total templates loaded:', allTemplates.length);
    console.log('Template IDs:', allTemplates.map(t => t.id));
    
    // Test 2: Get birthday templates specifically
    console.log('\n📋 Test 2: Getting birthday templates...');
    const birthdayTemplates = await dataProvider.getTemplatesByCategory('birthday');
    console.log('✅ Birthday templates loaded:', birthdayTemplates.length);
    console.log('Birthday template IDs:', birthdayTemplates.map(t => t.id));
    
    // Test 3: Check expected birthday templates
    const expectedBirthdayTemplates = [
      'temp1', 'temp2', 'temp3', 'temp4',  // Original templates
      'temp21', 'temp22', 'temp23', 'temp24', // First batch of new templates
      'temp25', 'temp26', 'temp27', 'temp28'  // Second batch of new templates
    ];
    
    console.log('\n📊 Checking for expected birthday templates:');
    expectedBirthdayTemplates.forEach(templateId => {
      const found = birthdayTemplates.find(t => t.id === templateId);
      if (found) {
        console.log(`✅ ${templateId} found`);
      } else {
        console.log(`❌ ${templateId} NOT found`);
      }
    });
    
    // Test 4: Check templates data structure
    console.log('\n📋 Test 4: Checking templates data structure...');
    const templatesData = await dataProvider.getTemplatesData();
    console.log('✅ Templates data loaded:', Object.keys(templatesData).length);
    console.log('Template data keys:', Object.keys(templatesData));
    
    // Test 5: Check image cards mapping
    console.log('\n📋 Test 5: Checking image cards mapping...');
    const imageCardsMapping = await dataProvider.getImageCardsMapping();
    console.log('✅ Image cards mapping loaded');
    console.log('Mapping keys:', Object.keys(imageCardsMapping));
    
    // Check birthday category mapping (should be img1)
    const birthdayMapping = imageCardsMapping['img1'];
    if (birthdayMapping) {
      console.log('✅ Birthday category mapping found:', birthdayMapping);
      console.log('Birthday templates in mapping:', birthdayMapping.length);
    } else {
      console.log('❌ Birthday category mapping not found');
    }
    
    // Test 6: Check category mapping
    console.log('\n📋 Test 6: Checking category mapping...');
    const categoryMapping = await dataProvider.getCategoryMapping();
    console.log('✅ Category mapping loaded');
    console.log('Category mapping:', categoryMapping);
    
    // Test 7: Verify all templates have proper metadata
    console.log('\n📋 Test 7: Checking template metadata...');
    const sampleTemplate = birthdayTemplates[0];
    if (sampleTemplate) {
      console.log('Sample template metadata:');
      console.log('- ID:', sampleTemplate.id);
      console.log('- Title:', sampleTemplate.title);
      console.log('- Category:', sampleTemplate.category);
      console.log('- Author:', sampleTemplate.author);
      console.log('- Price:', sampleTemplate.price);
      console.log('- Popularity:', sampleTemplate.popularity);
      console.log('- Downloads:', sampleTemplate.num_downloads);
      console.log('- Pages count:', sampleTemplate.pages.length);
    }
    
    // Test 8: Summary
    console.log('\n🎉 All templates test completed!');
    console.log(`\n📝 Summary:`);
    console.log(`- Total templates: ${allTemplates.length}`);
    console.log(`- Birthday templates: ${birthdayTemplates.length}`);
    console.log(`- Expected birthday templates: ${expectedBirthdayTemplates.length}`);
    
    if (birthdayTemplates.length === expectedBirthdayTemplates.length) {
      console.log('✅ All birthday templates are loaded correctly!');
    } else {
      console.log('❌ Some birthday templates are missing!');
      console.log('Missing templates:', expectedBirthdayTemplates.filter(id => 
        !birthdayTemplates.find(t => t.id === id)
      ));
    }
    
    // Test 9: Check if templates are in templatesData
    console.log('\n📋 Test 9: Checking templatesData for birthday templates...');
    expectedBirthdayTemplates.forEach(templateId => {
      if (templatesData[templateId]) {
        console.log(`✅ ${templateId} found in templatesData`);
      } else {
        console.log(`❌ ${templateId} NOT found in templatesData`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
window.testAllTemplates = testAllTemplates;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  testAllTemplates();
} 