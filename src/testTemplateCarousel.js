/**
 * Test Template Carousel Functionality
 * 
 * This file tests the new template carousel feature
 */

import dataProvider from './services/dataProvider.js';

async function testTemplateCarousel() {
  console.log('🧪 Testing Template Carousel...');
  
  try {
    // Test getting templates for birthday category
    console.log('\n📋 Testing birthday category templates...');
    const birthdayTemplates = await dataProvider.getTemplatesByCategory('birthday');
    
    console.log('✅ Birthday templates loaded:', birthdayTemplates.length);
    console.log('Template IDs:', birthdayTemplates.map(t => t.id));
    
    // Test template metadata
    const firstTemplate = birthdayTemplates[0];
    console.log('\n📊 First template metadata:');
    console.log('- ID:', firstTemplate.id);
    console.log('- Title:', firstTemplate.title);
    console.log('- Author:', firstTemplate.author);
    console.log('- Price:', firstTemplate.price);
    console.log('- Popularity:', firstTemplate.popularity);
    console.log('- Downloads:', firstTemplate.num_downloads);
    
    // Test carousel functionality
    console.log('\n🎠 Testing carousel functionality...');
    const templatesToShow = window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4;
    console.log('- Templates to show:', templatesToShow);
    console.log('- Total templates:', birthdayTemplates.length);
    console.log('- Pages needed:', Math.ceil(birthdayTemplates.length / templatesToShow));
    
    // Test template data structure
    console.log('\n📋 Testing template data structure...');
    const templatesData = await dataProvider.getTemplatesData();
    console.log('✅ Templates data loaded:', Object.keys(templatesData).length);
    
    // Check if new templates are included
    const newTemplates = ['temp21', 'temp22', 'temp23', 'temp24', 'temp25', 'temp26', 'temp27', 'temp28'];
    newTemplates.forEach(templateId => {
      if (templatesData[templateId]) {
        console.log(`✅ ${templateId} found in templates data`);
      } else {
        console.log(`❌ ${templateId} not found in templates data`);
      }
    });
    
    console.log('\n🎉 Template carousel test completed!');
    console.log('\n📝 To test the carousel:');
    console.log('1. Go to the Birthday category');
    console.log('2. You should see templates in a carousel format');
    console.log('3. Use arrow buttons or drag to navigate');
    console.log('4. Click on templates to open the flipbook');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
window.testTemplateCarousel = testTemplateCarousel;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  testTemplateCarousel();
} 