/**
 * Simple test for data provider functionality
 * Run this in browser console to test
 */

import dataProvider from './services/dataProvider.js';

async function testDataProvider() {
  console.log('🧪 Testing Data Provider...');
  
  try {
    // Test 1: Get categories
    console.log('\n📋 Test 1: Getting categories...');
    const categories = await dataProvider.getCategories();
    console.log('✅ Categories loaded:', categories.length);
    console.log('First category:', categories[0]);
    
    // Test 2: Get templates
    console.log('\n📄 Test 2: Getting templates...');
    const templates = await dataProvider.getTemplates();
    console.log('✅ Templates loaded:', templates.length);
    console.log('First template:', templates[0]);
    
    // Test 3: Get image cards mapping
    console.log('\n🃏 Test 3: Getting image cards mapping...');
    const imageCards = await dataProvider.getImageCardsMapping();
    console.log('✅ Image cards mapping:', Object.keys(imageCards).length, 'categories');
    console.log('Sample mapping:', imageCards);
    
    // Test 4: Get categories for carousel
    console.log('\n🎠 Test 4: Getting categories for carousel...');
    const carouselCategories = await dataProvider.getCategoriesForCarousel();
    console.log('✅ Carousel categories:', carouselCategories.length);
    console.log('First carousel category:', carouselCategories[0]);
    
    // Test 5: Get templates data
    console.log('\n📊 Test 5: Getting templates data...');
    const templatesData = await dataProvider.getTemplatesData();
    console.log('✅ Templates data:', Object.keys(templatesData).length, 'templates');
    console.log('Sample template data:', templatesData.temp1);
    
    console.log('\n🎉 All tests passed! Data provider is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
window.testDataProvider = testDataProvider;

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined') {
  testDataProvider();
} 