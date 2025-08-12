/**
 * SMARTWISH TEMPLATE SERVICE - FRONTEND
 * 
 * Frontend service for template operations
 * Communicates with backend API and provides local fallback
 * 
 * @version 1.0.0
 * @author SmartWish Team
 */

import {
  TEMPLATES,
  CATEGORIES,
  getAllTemplates,
  getTemplateById,
  getAllCategories,
  getCategoryById,
  getTemplatesByCategory,
  searchTemplates,
  getCategoryNames
} from '../utils/templatesWrapper.js';

class TemplateService {
  constructor() {
    this.API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.useLocalFallback = true; // Set to false when backend is fully integrated
  }

  /**
   * Get all templates with optional filtering
   * @param {Object} filter - Filter options
   * @returns {Promise<Array>} Array of templates
   */
  async getAllTemplates(filter = {}) {
    if (this.useLocalFallback) {
      return this.getLocalTemplates(filter);
    }

    try {
      const queryParams = new URLSearchParams();
      if (filter.category) queryParams.append('category', filter.category);
      if (filter.searchTerm) queryParams.append('search', filter.searchTerm);
      if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
      if (filter.sortOrder) queryParams.append('sortOrder', filter.sortOrder);

      const response = await fetch(`${this.API_BASE_URL}/api/templates?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch templates');
      }
    } catch (error) {
      console.warn('API call failed, using local fallback:', error.message);
      return this.getLocalTemplates(filter);
    }
  }

  /**
   * Get template by ID
   * @param {string} templateId - Template ID
   * @returns {Promise<Object|null>} Template object or null
   */
  async getTemplateById(templateId) {
    if (this.useLocalFallback) {
      return getTemplateById(templateId);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/templates/${templateId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Template not found');
      }
    } catch (error) {
      console.warn('API call failed, using local fallback:', error.message);
      return getTemplateById(templateId);
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  async getAllCategories() {
    if (this.useLocalFallback) {
      return getAllCategories();
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/categories`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.warn('API call failed, using local fallback:', error.message);
      return getAllCategories();
    }
  }

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object|null>} Category object or null
   */
  async getCategoryById(categoryId) {
    if (this.useLocalFallback) {
      return getCategoryById(categoryId);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/categories/${categoryId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Category not found');
      }
    } catch (error) {
      console.warn('API call failed, using local fallback:', error.message);
      return getCategoryById(categoryId);
    }
  }

  /**
   * Get templates by category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Array>} Array of templates
   */
  async getTemplatesByCategory(categoryId) {
    if (this.useLocalFallback) {
      return getTemplatesByCategory(categoryId);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/templates/category/${categoryId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch templates by category');
      }
    } catch (error) {
      console.warn('API call failed, using local fallback:', error.message);
      return getTemplatesByCategory(categoryId);
    }
  }

  /**
   * Search templates by keyword
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching templates
   */
  async searchTemplates(searchTerm) {
    if (this.useLocalFallback) {
      return searchTemplates(searchTerm);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/templates/search/${encodeURIComponent(searchTerm)}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Search failed');
      }
    } catch (error) {
      console.warn('API call failed, using local fallback:', error.message);
      return searchTemplates(searchTerm);
    }
  }

  /**
   * Get category names for dropdowns
   * @returns {Promise<Array>} Array of category names
   */
  async getCategoryNames() {
    if (this.useLocalFallback) {
      return getCategoryNames();
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/categories/names`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch category names');
      }
    } catch (error) {
      console.warn('API call failed, using local fallback:', error.message);
      return getCategoryNames();
    }
  }

  /**
   * Get template statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getTemplateStats() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/templates/stats`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.warn('Failed to fetch template statistics:', error.message);
      return {
        totalTemplates: Object.keys(TEMPLATES).length,
        totalCategories: Object.keys(CATEGORIES).length,
        templatesByCategory: {}
      };
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Get templates using local data with filtering
   * @param {Object} filter - Filter options
   * @returns {Array} Filtered templates
   */
  getLocalTemplates(filter = {}) {
    let templates = getAllTemplates();

    // Apply category filter
    if (filter.category) {
      templates = templates.filter(template => template.category === filter.category);
    }

    // Apply search filter
    if (filter.searchTerm) {
      templates = searchTemplates(filter.searchTerm);
    }

    // Apply sorting
    if (filter.sortBy) {
      templates = this.sortTemplates(templates, filter.sortBy, filter.sortOrder || 'asc');
    }

    return templates;
  }

  /**
   * Sort templates locally
   * @param {Array} templates - Templates to sort
   * @param {string} sortBy - Sort criteria
   * @param {string} sortOrder - Sort order
   * @returns {Array} Sorted templates
   */
  sortTemplates(templates, sortBy, sortOrder) {
    return [...templates].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'recent':
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Enable or disable local fallback
   * @param {boolean} useLocal - Whether to use local fallback
   */
  setLocalFallback(useLocal) {
    this.useLocalFallback = useLocal;
  }
}

// Create and export singleton instance
const templateService = new TemplateService();
export default templateService;
