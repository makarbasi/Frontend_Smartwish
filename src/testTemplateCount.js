/**
 * Test Template Count for Birthday Category
 * 
 * This file tests that all birthday templates are loaded correctly
 */

import dataProvider from './services/dataProvider.js';

async function testBirthdayTemplateCount() {
  console.log('🧪 Testing Birthday Template Count...');
  
  try {
    // Test getting templates for birthday category
    console.log('\n📋 Testing birthday category templates...');
    const birthdayTemplates = await dataProvider.getTemplatesByCategory('birthday');
    
    console.log('✅ Birthday templates loaded:', birthdayTemplates.length);
    console.log('Template IDs:', birthdayTemplates.map(t => t.id));
    
    // Check for specific templates
    const expectedTemplates = [
      'temp1', 'temp2', 'temp3', 'temp4',  // Original templates
      'temp21', 'temp22', 'temp23', 'temp24', // First batch of new templates
      'temp25', 'temp26', 'temp27', 'temp28'  // Second batch of new templates
    ];
    
    console.log('\n📊 Checking for expected templates:');
    expectedTemplates.forEach(templateId => {
      const found = birthdayTemplates.find(t => t.id === templateId);
      if (found) {
        console.log(`✅ ${templateId} found`);
      } else {
        console.log(`❌ ${templateId} NOT found`);
      }
    });
    
    // Test template data structure
    console.log('\n📋 Testing template data structure...');
    const templatesData = await dataProvider.getTemplatesData();
    console.log('✅ Templates data loaded:', Object.keys(templatesData).length);
    
    // Check if all birthday templates are in templatesData
    console.log('\n📊 Checking templatesData for birthday templates:');
    expectedTemplates.forEach(templateId => {
      if (templatesData[templateId]) {
        console.log(`✅ ${templateId} found in templatesData`);
      } else {
        console.log(`❌ ${templateId} NOT found in templatesData`);
      }
    });
    
    console.log('\n🎉 Birthday template count test completed!');
    console.log(`\n📝 Expected: ${expectedTemplates.length} templates`);
    console.log(`📝 Found: ${birthdayTemplates.length} templates`);
    
    if (birthdayTemplates.length === expectedTemplates.length) {
      console.log('✅ All birthday templates are loaded correctly!');
    } else {
      console.log('❌ Some birthday templates are missing!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
window.testBirthdayTemplateCount = testBirthdayTemplateCount;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  testBirthdayTemplateCount();
} 