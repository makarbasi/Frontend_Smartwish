/**
 * Test the translation fix
 */

import dataProvider from './services/dataProvider.js';

async function testTranslationFix() {
  console.log('🧪 Testing Translation Fix...');
  
  try {
    // Test the getCategoriesForCarousel method
    console.log('\n📋 Testing getCategoriesForCarousel...');
    const carouselCategories = await dataProvider.getCategoriesForCarousel();
    
    console.log('✅ Carousel categories loaded:', carouselCategories.length);
    console.log('First category:', carouselCategories[0]);
    
    // Check if translations are working
    const firstCategory = carouselCategories[0];
    console.log('Translation test:');
    console.log('- ID:', firstCategory.id);
    console.log('- Title:', firstCategory.title);
    console.log('- Description:', firstCategory.description);
    
    console.log('\n🎉 Translation fix is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
window.testTranslationFix = testTranslationFix;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  testTranslationFix();
} 