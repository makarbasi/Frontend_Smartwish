/**
 * SMARTWISH DATA PROVIDER
 * 
 * Abstract data access layer that can be easily replaced with Supabase
 * Provides a clean interface for categories and templates
 * 
 * @version 1.0.0
 * @author SmartWish Team
 */

import {
  CATEGORIES,
  TEMPLATES,
  getAllCategories,
  getAllTemplates,
  getTemplatesByCategory,
  searchTemplates,
  getTemplateById,
  getCategoryById
} from '../utils/templatesWrapper.js';
import { getDataProviderConfig } from '../config/dataConfig.js';

class DataProvider {
  constructor() {
    const config = getDataProviderConfig();
    this.useLocalData = config.useLocalData;
    this.apiBaseUrl = config.apiBaseUrl;
    this.cacheTimeout = config.cacheTimeout;
    this.enableCaching = config.enableCaching;
    this.enableFallback = config.enableFallback;
    
    this.cache = {
      categories: null,
      templates: null,
      lastUpdated: null
    };
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    if (this.useLocalData) {
      return this.getLocalCategories();
    }

    // Future Supabase implementation will go here
    // const { data, error } = await supabase
    //   .from('categories')
    //   .select('*')
    //   .order('sortOrder');
    
    // For now, fallback to local data
    return this.getLocalCategories();
  }

  /**
   * Get all templates
   * @returns {Promise<Array>} Array of templates
   */
  async getTemplates() {
    if (this.useLocalData) {
      return this.getLocalTemplates();
    }

    // Future Supabase implementation will go here
    // const { data, error } = await supabase
    //   .from('templates')
    //   .select('*');
    
    // For now, fallback to local data
    return this.getLocalTemplates();
  }

  /**
   * Get templates by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of templates
   */
  async getTemplatesByCategory(categoryId) {
    if (this.useLocalData) {
      return getTemplatesByCategory(categoryId);
    }

    // Future Supabase implementation will go here
    // const { data, error } = await supabase
    //   .from('templates')
    //   .select('*')
    //   .eq('category', categoryId);
    
    // For now, fallback to local data
    return getTemplatesByCategory(categoryId);
  }

  /**
   * Search templates
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching templates
   */
  async searchTemplates(searchTerm) {
    if (this.useLocalData) {
      return searchTemplates(searchTerm);
    }

    // Future Supabase implementation will go here
    // const { data, error } = await supabase
    //   .from('templates')
    //   .select('*')
    //   .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,searchKeywords.cs.{${searchTerm}}`);
    
    // For now, fallback to local data
    return searchTemplates(searchTerm);
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object|null>} Template object or null
   */
  async getTemplateById(templateId) {
    if (this.useLocalData) {
      return getTemplateById(templateId);
    }

    // Future Supabase implementation will go here
    // const { data, error } = await supabase
    //   .from('templates')
    //   .select('*')
    //   .eq('id', templateId)
    //   .single();
    
    // For now, fallback to local data
    return getTemplateById(templateId);
  }

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object|null>} Category object or null
   */
  async getCategoryById(categoryId) {
    if (this.useLocalData) {
      return getCategoryById(categoryId);
    }

    // Future Supabase implementation will go here
    // const { data, error } = await supabase
    //   .from('categories')
    //   .select('*')
    //   .eq('id', categoryId)
    //   .single();
    
    // For now, fallback to local data
    return getCategoryById(categoryId);
  }

  /**
   * Get category mapping for frontend (img1, img2, etc.)
   * @returns {Promise<Object>} Category mapping object
   */
  async getCategoryMapping() {
    const categories = await this.getCategories();
    const mapping = {};
    
    categories.forEach((category, index) => {
      const imgKey = `img${index + 1}`;
      mapping[imgKey] = category.id;
    });
    
    return mapping;
  }

  /**
   * Get template mapping for frontend (temp1, temp2, etc.)
   * @returns {Promise<Object>} Template mapping object
   */
  async getTemplateMapping() {
    const templates = await this.getTemplates();
    const mapping = {};
    
    templates.forEach((template, index) => {
      const tempKey = `temp${index + 1}`;
      mapping[tempKey] = template.id;
    });
    
    return mapping;
  }

  /**
   * Get image cards mapping (category -> template IDs)
   * @returns {Promise<Object>} Image cards mapping
   */
  async getImageCardsMapping() {
    const categories = await this.getCategories();
    const templates = await this.getTemplates();
    const mapping = {};
    
    categories.forEach((category, categoryIndex) => {
      const imgKey = `img${categoryIndex + 1}`;
      const categoryTemplates = templates.filter(t => t.category === category.id);
      
      // Use the actual template ID instead of creating new keys
      mapping[imgKey] = categoryTemplates.map(template => template.id);
    });
    
    return mapping;
  }

  /**
   * Get categories for frontend carousel
   * @returns {Promise<Array>} Categories formatted for frontend
   */
  async getCategoriesForCarousel() {
    const categories = await this.getCategories();
    
    // Import translations and create a simple translation function
    let t;
    try {
      const { translations } = await import('../utils/translations.js');
      t = (key) => {
        return translations.en[key] || key;
      };
    } catch (error) {
      console.warn('Translation function not available, using fallback');
      t = (key) => key; // Fallback function that returns the key as-is
    }
    
    return categories.map((category, index) => ({
      id: `img${index + 1}`,
      title: t(category.id) || category.displayName,
      description: t(`${category.id}Description`) || category.description,
      coverImage: category.coverImage,
      templateCount: category.templateCount,
      categoryId: category.id
    }));
  }

  /**
   * Get templates data for frontend
   * @returns {Promise<Object>} Templates in frontend format
   */
  async getTemplatesData() {
    const templates = await this.getTemplates();
    
    const templatesObj = {};
    
    templates.forEach((template) => {
      // Use the actual template ID as the key
      templatesObj[template.id] = {
        title: template.title,
        pages: template.pages,
        category: template.category,
        description: template.description,
        // Include all other template properties
        searchKeywords: template.searchKeywords,
        upload_time: template.upload_time,
        author: template.author,
        price: template.price,
        language: template.language,
        region: template.region,
        popularity: template.popularity,
        num_downloads: template.num_downloads
      };
    });
    
    return templatesObj;
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Get local categories
   * @returns {Array} Categories array
   */
  getLocalCategories() {
    return getAllCategories();
  }

  /**
   * Get local templates
   * @returns {Array} Templates array
   */
  getLocalTemplates() {
    const templates = getAllTemplates();
    return templates;
  }

  /**
   * Enable or disable local data mode
   * @param {boolean} useLocal - Whether to use local data
   */
  setLocalDataMode(useLocal) {
    this.useLocalData = useLocal;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      categories: null,
      templates: null,
      lastUpdated: null
    };
  }

  /**
   * Check if cache is valid
   * @returns {boolean} Whether cache is valid
   */
  isCacheValid() {
    return this.cache.lastUpdated && 
           (Date.now() - this.cache.lastUpdated) < this.cacheTimeout;
  }
}

// Create and export singleton instance
const dataProvider = new DataProvider();
export default dataProvider; 