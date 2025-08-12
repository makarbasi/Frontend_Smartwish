/**
 * Debug Template Loading
 * 
 * This script helps debug why only 4 templates are showing in the birthday category
 */

import dataProvider from './services/dataProvider.js';

async function debugTemplates() {
  console.log('🔍 Debugging Template Loading...');
  
  try {
    // Step 1: Test basic template loading
    console.log('\n📋 Step 1: Testing basic template loading...');
    const allTemplates = await dataProvider.getTemplates();
    console.log('✅ Total templates loaded:', allTemplates.length);
    console.log('All template IDs:', allTemplates.map(t => t.id));
    
    // Step 2: Test birthday templates specifically
    console.log('\n📋 Step 2: Testing birthday templates...');
    const birthdayTemplates = await dataProvider.getTemplatesByCategory('birthday');
    console.log('✅ Birthday templates loaded:', birthdayTemplates.length);
    console.log('Birthday template IDs:', birthdayTemplates.map(t => t.id));
    
    // Step 3: Check templates data structure
    console.log('\n📋 Step 3: Checking templates data structure...');
    const templatesData = await dataProvider.getTemplatesData();
    console.log('✅ Templates data loaded:', Object.keys(templatesData).length);
    console.log('Template data keys:', Object.keys(templatesData));
    
    // Step 4: Check image cards mapping
    console.log('\n📋 Step 4: Checking image cards mapping...');
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
    
    // Step 5: Check category mapping
    console.log('\n📋 Step 5: Checking category mapping...');
    const categoryMapping = await dataProvider.getCategoryMapping();
    console.log('✅ Category mapping loaded');
    console.log('Category mapping:', categoryMapping);
    
    // Step 6: Check if img1 maps to birthday
    console.log('\n📋 Step 6: Checking img1 -> birthday mapping...');
    const img1Category = categoryMapping['img1'];
    console.log('img1 maps to category:', img1Category);
    
    if (img1Category === 'birthday') {
      console.log('✅ img1 correctly maps to birthday category');
    } else {
      console.log('❌ img1 does not map to birthday category');
    }
    
    // Step 7: Check what templates are actually in the birthday mapping
    console.log('\n📋 Step 7: Checking birthday mapping templates...');
    if (birthdayMapping) {
      birthdayMapping.forEach((templateId, index) => {
        console.log(`${index + 1}. ${templateId}`);
      });
    }
    
    // Step 8: Check if all expected templates exist in templatesData
    console.log('\n📋 Step 8: Checking if all templates exist in templatesData...');
    const expectedTemplates = ['temp1', 'temp2', 'temp3', 'temp4', 'temp21', 'temp22', 'temp23', 'temp24', 'temp25', 'temp26', 'temp27', 'temp28'];
    expectedTemplates.forEach(templateId => {
      if (templatesData[templateId]) {
        console.log(`✅ ${templateId} exists in templatesData`);
      } else {
        console.log(`❌ ${templateId} NOT found in templatesData`);
      }
    });
    
    // Step 9: Check if all expected templates are in birthdayTemplates
    console.log('\n📋 Step 9: Checking if all templates are in birthdayTemplates...');
    expectedTemplates.forEach(templateId => {
      const found = birthdayTemplates.find(t => t.id === templateId);
      if (found) {
        console.log(`✅ ${templateId} found in birthdayTemplates`);
      } else {
        console.log(`❌ ${templateId} NOT found in birthdayTemplates`);
      }
    });
    
    // Step 10: Check if all expected templates are in birthdayMapping
    console.log('\n📋 Step 10: Checking if all templates are in birthdayMapping...');
    if (birthdayMapping) {
      expectedTemplates.forEach(templateId => {
        if (birthdayMapping.includes(templateId)) {
          console.log(`✅ ${templateId} found in birthdayMapping`);
        } else {
          console.log(`❌ ${templateId} NOT found in birthdayMapping`);
        }
      });
    }
    
    console.log('\n🎉 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error stack:', error.stack);
  }
}

// Export for use in browser console
window.debugTemplates = debugTemplates;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  debugTemplates();
} 