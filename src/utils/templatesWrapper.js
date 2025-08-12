// Direct implementation of templates to avoid CommonJS/ES6 compatibility issues
// This replaces the problematic import from the compiled templates.js file

// Export constants
export const CATEGORIES = {
  BIRTHDAY: {
    id: 'birthday',
    name: 'Birthday',
    displayName: 'Birthday',
    description: 'Celebrate special birthdays with vibrant and fun designs',
    coverImage: '/images/img-cover-1.jpg',
    templateCount: 12,
    sortOrder: 1
  },
  ANNIVERSARY: {
    id: 'anniversary',
    name: 'Anniversary',
    displayName: 'Anniversary',
    description: 'Romantic and elegant designs for anniversaries',
    coverImage: '/images/img-cover-2.jpg',
    templateCount: 4,
    sortOrder: 2
  },
  CONGRATULATIONS: {
    id: 'congratulations',
    name: 'Congratulations',
    displayName: 'Congratulations',
    description: 'Celebrate achievements and milestones',
    coverImage: '/images/img-cover-3.jpg',
    templateCount: 4,
    sortOrder: 3
  },
  THANK_YOU: {
    id: 'thankYou',
    name: 'Thank You',
    displayName: 'Thank You',
    description: 'Express gratitude with heartfelt designs',
    coverImage: '/images/img-cover-4.jpg',
    templateCount: 4,
    sortOrder: 4
  },
  SYMPATHY: {
    id: 'sympathy',
    name: 'Sympathy',
    displayName: 'Sympathy',
    description: 'Thoughtful designs for difficult times',
    coverImage: '/images/img-cover-5.jpg',
    templateCount: 4,
    sortOrder: 5
  },
  WEDDING: {
    id: 'wedding',
    name: 'Wedding',
    displayName: 'Wedding',
    description: 'Beautiful designs for wedding celebrations',
    coverImage: '/images/img-cover-6.jpg',
    templateCount: 4,
    sortOrder: 6
  },
  GRADUATION: {
    id: 'graduation',
    name: 'Graduation',
    displayName: 'Graduation',
    description: 'Celebrate academic achievements',
    coverImage: '/images/img-cover-7.jpg',
    templateCount: 4,
    sortOrder: 7
  },
  HOLIDAY: {
    id: 'holiday',
    name: 'Holiday',
    displayName: 'Holiday',
    description: 'Festive designs for holiday celebrations',
    coverImage: '/images/img-cover-8.jpg',
    templateCount: 4,
    sortOrder: 8
  }
};

// Export templates
export const TEMPLATES = {
  temp1: {
    id: 'temp1',
    title: 'Vibrant Birthday Celebration',
    category: 'birthday',
    description: 'Birthday card with vibrant colors, fun design, balloons, and gifts. Perfect for birthday celebrations.',
    searchKeywords: ['birthday', 'vibrant', 'colorful', 'balloons', 'gifts', 'celebration', 'party'],
    upload_time: '2024-01-15T10:30:00Z',
    author: 'SmartWish',
    price: 2.99,
    language: 'en',
    region: 'US',
    popularity: 95,
    num_downloads: 1247,
    pages: [
      {
        header: 'Happy Birthday!',
        image: 'images/temp1.png',
        text: 'Birthday, vibrant colors, and a fun design, Balloons, gifts',
        footer: '1'
      },
      {
        header: 'Celebrate Today',
        image: 'images/blank.jpg',
        text: 'Birthday, big text',
        footer: '2'
      },
      {
        header: 'Special Day',
        image: 'images/blank.jpg',
        text: 'Birthday, simple, mono color',
        footer: '3'
      },
      {
        header: 'Birthday Wishes',
        image: 'images/blank_logo.png',
        text: 'Birthday, girly, Balloons, cake',
        footer: '4'
      }
    ]
  },
  temp2: {
    id: 'temp2',
    title: 'Classic Birthday Card',
    category: 'birthday',
    description: 'Simple and elegant birthday design with big text and classic styling.',
    searchKeywords: ['birthday', 'classic', 'simple', 'elegant', 'traditional'],
    upload_time: '2024-01-20T14:15:00Z',
    author: 'Emma Rodriguez',
    price: 1.99,
    language: 'en',
    region: 'US',
    popularity: 87,
    num_downloads: 892,
    pages: [
      {
        header: 'Birthday Greetings',
        image: 'images/temp2.jpg',
        text: 'Birthday, big text',
        footer: '1'
      },
      {
        header: 'Another Year',
        image: 'images/blank.png',
        text: 'Birthday celebration',
        footer: '2'
      },
      {
        header: 'Special Moment',
        image: 'images/blank.png',
        text: 'Birthday wishes',
        footer: '3'
      },
      {
        header: 'Celebrate',
        image: 'images/blank_logo.png',
        text: 'Birthday joy',
        footer: '4'
      }
    ]
  },
  temp3: {
    id: 'temp3',
    title: 'Minimalist Birthday',
    category: 'birthday',
    description: 'Clean and minimalist birthday design with simple, mono color theme.',
    searchKeywords: ['birthday', 'minimalist', 'simple', 'clean', 'mono', 'modern'],
    upload_time: '2024-02-05T09:45:00Z',
    author: 'SmartWish',
    price: 0.99,
    language: 'en',
    region: 'US',
    popularity: 78,
    num_downloads: 654,
    pages: [
      {
        header: 'Simple Birthday',
        image: 'images/temp3.jpg',
        text: 'Birthday, simple, mono color',
        footer: '1'
      },
      {
        header: 'Clean Design',
        image: 'images/blank.png',
        text: 'Minimalist birthday',
        footer: '2'
      },
      {
        header: 'Modern Style',
        image: 'images/blank.png',
        text: 'Simple birthday wishes',
        footer: '3'
      },
      {
        header: 'Minimalist Joy',
        image: 'images/blank_logo.png',
        text: 'Clean birthday celebration',
        footer: '4'
      }
    ]
  },
  temp4: {
    id: 'temp4',
    title: 'Birthday Memories',
    category: 'birthday',
    description: 'Heartfelt birthday card celebrating memories and milestones.',
    searchKeywords: ['birthday', 'memories', 'milestones', 'heartfelt', 'celebration'],
    upload_time: '2024-01-18T16:20:00Z',
    author: 'SmartWish',
    price: 3.49,
    language: 'en',
    region: 'US',
    popularity: 92,
    num_downloads: 1103,
    pages: [
      {
        header: 'Birthday Memories',
        image: 'images/temp4.png',
        text: 'Birthday, memories',
        footer: '1'
      },
      {
        header: 'Special Moments',
        image: 'images/blank.jpg',
        text: 'Birthday, special moments',
        footer: '2'
      },
      {
        header: 'Milestone Celebration',
        image: 'images/blank.jpg',
        text: 'Birthday milestones',
        footer: '3'
      },
      {
        header: 'Heartfelt Wishes',
        image: 'images/blank_logo.png',
        text: 'Birthday memories',
        footer: '4'
      }
    ]
  },
  temp21: {
    id: 'temp21',
    title: 'New Custom Design',
    category: 'birthday',
    description: 'A brand new custom design template with modern styling.',
    searchKeywords: ['custom', 'modern', 'new', 'design', 'birthday'],
    upload_time: '2024-01-20T12:00:00Z',
    author: 'SmartWish',
    price: 3.99,
    language: 'en',
    region: 'US',
    popularity: 95,
    num_downloads: 0,
    pages: [
      {
        header: 'Custom Header',
        image: 'images/temp21.jpg',
        text: 'Custom design text and content',
        footer: '1'
      },
      {
        header: 'Page Two',
        image: 'images/blank.jpg',
        text: 'Second page content',
        footer: '2'
      },
      {
        header: 'Page Three',
        image: 'images/blank.jpg',
        text: 'Third page content',
        footer: '3'
      },
      {
        header: 'Final Page',
        image: 'images/blank_logo.png',
        text: 'Final page with logo',
        footer: '4'
      }
    ]
  },
  temp22: {
    id: 'temp22',
    title: 'Modern Birthday Celebration',
    category: 'birthday',
    description: 'A modern, vibrant birthday design with contemporary styling and bold colors.',
    searchKeywords: ['birthday', 'modern', 'vibrant', 'celebration', 'contemporary'],
    upload_time: '2024-01-21T10:00:00Z',
    author: 'Emma Rodriguez',
    price: 4.99,
    language: 'en',
    region: 'US',
    popularity: 92,
    num_downloads: 156,
    pages: [
      {
        header: 'Happy Birthday!',
        image: 'images/temp22.jpg',
        text: 'Modern birthday celebration with vibrant colors',
        footer: '1'
      },
      {
        header: 'Celebrate Today',
        image: 'images/blank.jpg',
        text: 'Contemporary birthday design',
        footer: '2'
      },
      {
        header: 'Special Day',
        image: 'images/blank.jpg',
        text: 'Modern birthday wishes',
        footer: '3'
      },
      {
        header: 'Birthday Joy',
        image: 'images/blank_logo.png',
        text: 'Contemporary birthday celebration',
        footer: '4'
      }
    ]
  },
  temp23: {
    id: 'temp23',
    title: 'Elegant Birthday Wishes',
    category: 'birthday',
    description: 'Sophisticated birthday design with elegant typography and refined styling.',
    searchKeywords: ['birthday', 'elegant', 'sophisticated', 'refined', 'typography'],
    upload_time: '2024-01-22T14:30:00Z',
    author: 'Alex Thompson',
    price: 3.49,
    language: 'en',
    region: 'US',
    popularity: 88,
    num_downloads: 89,
    pages: [
      {
        header: 'Birthday Wishes',
        image: 'images/temp23.jpg',
        text: 'Elegant birthday celebration',
        footer: '1'
      },
      {
        header: 'Special Celebration',
        image: 'images/blank.jpg',
        text: 'Sophisticated design',
        footer: '2'
      },
      {
        header: 'Joyful Day',
        image: 'images/blank.jpg',
        text: 'Elegant birthday wishes',
        footer: '3'
      },
      {
        header: 'Celebrate Life',
        image: 'images/blank_logo.png',
        text: 'Refined birthday celebration',
        footer: '4'
      }
    ]
  },
  temp24: {
    id: 'temp24',
    title: 'Fun Birthday Party',
    category: 'birthday',
    description: 'Playful and fun birthday design perfect for children and young adults.',
    searchKeywords: ['birthday', 'fun', 'playful', 'party', 'children', 'young'],
    upload_time: '2024-01-23T16:45:00Z',
    author: 'SmartWish',
    price: 2.99,
    language: 'en',
    region: 'US',
    popularity: 85,
    num_downloads: 234,
    pages: [
      {
        header: 'Party Time!',
        image: 'images/temp24.jpg',
        text: 'Fun birthday party celebration',
        footer: '1'
      },
      {
        header: 'Let\'s Celebrate',
        image: 'images/blank.jpg',
        text: 'Playful birthday design',
        footer: '2'
      },
      {
        header: 'Birthday Fun',
        image: 'images/blank.jpg',
        text: 'Fun birthday wishes',
        footer: '3'
      },
      {
        header: 'Party On!',
        image: 'images/blank_logo.png',
        text: 'Fun birthday celebration',
        footer: '4'
      }
    ]
  },
  temp25: {
    id: 'temp25',
    title: 'Vintage Birthday Charm',
    category: 'birthday',
    description: 'Retro-inspired birthday design with vintage charm and nostalgic elements.',
    searchKeywords: ['birthday', 'vintage', 'retro', 'nostalgic', 'charm', 'classic'],
    upload_time: '2024-01-24T11:20:00Z',
    author: 'Emma Rodriguez',
    price: 3.99,
    language: 'en',
    region: 'US',
    popularity: 91,
    num_downloads: 187,
    pages: [
      {
        header: 'Vintage Birthday',
        image: 'images/temp25.jpg',
        text: 'Retro birthday celebration',
        footer: '1'
      },
      {
        header: 'Classic Charm',
        image: 'images/blank.jpg',
        text: 'Vintage birthday design',
        footer: '2'
      },
      {
        header: 'Nostalgic Wishes',
        image: 'images/blank.jpg',
        text: 'Retro birthday celebration',
        footer: '3'
      },
      {
        header: 'Timeless Joy',
        image: 'images/blank_logo.png',
        text: 'Vintage birthday charm',
        footer: '4'
      }
    ]
  },
  temp26: {
    id: 'temp26',
    title: 'Luxury Birthday Celebration',
    category: 'birthday',
    description: 'Premium birthday design with elegant typography and sophisticated styling.',
    searchKeywords: ['birthday', 'luxury', 'premium', 'elegant', 'sophisticated', 'premium'],
    upload_time: '2024-01-25T14:30:00Z',
    author: 'Alex Thompson',
    price: 5.99,
    language: 'en',
    region: 'US',
    popularity: 94,
    num_downloads: 156,
    pages: [
      {
        header: 'Luxury Birthday',
        image: 'images/temp26.jpg',
        text: 'Premium birthday celebration',
        footer: '1'
      },
      {
        header: 'Elegant Design',
        image: 'images/blank.jpg',
        text: 'Sophisticated birthday',
        footer: '2'
      },
      {
        header: 'Premium Wishes',
        image: 'images/blank.jpg',
        text: 'Luxury birthday design',
        footer: '3'
      },
      {
        header: 'Sophisticated Joy',
        image: 'images/blank_logo.png',
        text: 'Premium birthday celebration',
        footer: '4'
      }
    ]
  },
  temp27: {
    id: 'temp27',
    title: 'Adventure Birthday',
    category: 'birthday',
    description: 'Dynamic birthday design with adventure themes and exciting visuals.',
    searchKeywords: ['birthday', 'adventure', 'dynamic', 'exciting', 'exploration', 'journey'],
    upload_time: '2024-01-26T09:15:00Z',
    author: 'SmartWish',
    price: 3.49,
    language: 'en',
    region: 'US',
    popularity: 89,
    num_downloads: 203,
    pages: [
      {
        header: 'Adventure Awaits',
        image: 'images/temp27.jpg',
        text: 'Dynamic birthday adventure',
        footer: '1'
      },
      {
        header: 'Explore Today',
        image: 'images/blank.jpg',
        text: 'Adventure birthday design',
        footer: '2'
      },
      {
        header: 'Journey Begins',
        image: 'images/blank.jpg',
        text: 'Exciting birthday wishes',
        footer: '3'
      },
      {
        header: 'New Horizons',
        image: 'images/blank_logo.png',
        text: 'Adventure birthday celebration',
        footer: '4'
      }
    ]
  },
  temp28: {
    id: 'temp28',
    title: 'Cozy Birthday Warmth',
    category: 'birthday',
    description: 'Warm and cozy birthday design with comforting colors and gentle styling.',
    searchKeywords: ['birthday', 'cozy', 'warm', 'comforting', 'gentle', 'soft'],
    upload_time: '2024-01-27T16:45:00Z',
    author: 'Emma Rodriguez',
    price: 2.49,
    language: 'en',
    region: 'US',
    popularity: 87,
    num_downloads: 178,
    pages: [
      {
        header: 'Cozy Birthday',
        image: 'images/temp28.jpg',
        text: 'Warm birthday celebration',
        footer: '1'
      },
      {
        header: 'Warm Wishes',
        image: 'images/blank.jpg',
        text: 'Comforting birthday design',
        footer: '2'
      },
      {
        header: 'Gentle Joy',
        image: 'images/blank.jpg',
        text: 'Soft birthday wishes',
        footer: '3'
      },
      {
        header: 'Warmth & Love',
        image: 'images/blank_logo.png',
        text: 'Cozy birthday celebration',
        footer: '4'
      }
    ]
  },
  temp29: {
    id: 'temp29',
    title: 'My Custom Template',
    category: 'birthday',
    description: 'A custom template I created manually for testing.',
    searchKeywords: ['birthday', 'custom', 'manual', 'test', 'template'],
    upload_time: '2024-01-28T12:00:00Z',
    author: 'SmartWish',
    price: 1.99,
    language: 'en',
    region: 'US',
    popularity: 85,
    num_downloads: 0,
    pages: [
      {
        header: 'Custom Header',
        image: 'images/temp29.jpg',
        text: 'Custom template content',
        footer: '1'
      },
      {
        header: 'Page Two',
        image: 'images/blank.jpg',
        text: 'Second page content',
        footer: '2'
      },
      {
        header: 'Page Three',
        image: 'images/blank.jpg',
        text: 'Third page content',
        footer: '3'
      },
      {
        header: 'Final Page',
        image: 'images/blank_logo.png',
        text: 'Final page with logo',
        footer: '4'
      }
    ]
  }
};

// Export functions
export const getAllCategories = () => {
  return Object.values(CATEGORIES).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getAllTemplates = () => {
  const templates = Object.values(TEMPLATES);
  return templates;
};

export const getTemplatesByCategory = (categoryId) => {
  return Object.values(TEMPLATES).filter(template => template.category === categoryId);
};

export const searchTemplates = (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  const term = searchTerm.toLowerCase().trim();
  return Object.values(TEMPLATES).filter(template => {
    return (template.title.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.searchKeywords.some(keyword => keyword.toLowerCase().includes(term)) ||
      template.pages.some(page => page.header.toLowerCase().includes(term) ||
        page.text.toLowerCase().includes(term)));
  });
};

export const getTemplateById = (templateId) => {
  return TEMPLATES[templateId] || null;
};

export const getCategoryById = (categoryId) => {
  return Object.values(CATEGORIES).find(cat => cat.id === categoryId) || null;
};

export const getCategoryNames = () => {
  return getAllCategories().map(cat => cat.name);
};

export const getTemplateKeys = () => {
  return Object.keys(TEMPLATES);
};

export const validateTemplate = (template) => {
  console.log('Validating template structure:', template);
  
  if (!template || typeof template !== 'object') {
    console.log('❌ Template is not an object');
    return false;
  }
  
  const requiredFields = ['id', 'title', 'category', 'description', 'pages'];
  const hasRequiredFields = requiredFields.every(field => template.hasOwnProperty(field));
  
  if (!hasRequiredFields) {
    console.log('❌ Missing required fields. Required:', requiredFields);
    console.log('❌ Template has:', Object.keys(template));
    return false;
  }
  
  if (!Array.isArray(template.pages) || template.pages.length === 0) {
    console.log('❌ Pages is not an array or is empty:', template.pages);
    return false;
  }
  
  const validPages = template.pages.every((page) => {
    const hasRequired = page.hasOwnProperty('header') &&
      page.hasOwnProperty('image') &&
      page.hasOwnProperty('text') &&
      page.hasOwnProperty('footer');
    
    if (!hasRequired) {
      console.log('❌ Page missing required fields:', page);
    }
    
    return hasRequired;
  });
  
  console.log('✅ Template validation passed');
  return validPages;
};

export const getTemplateStats = () => {
  const templates = getAllTemplates();  
  const categories = getAllCategories();
  const stats = {
    totalTemplates: templates.length,
    totalCategories: categories.length,
    templatesByCategory: {}
  };
  categories.forEach(category => {
    stats.templatesByCategory[category.id] = getTemplatesByCategory(category.id).length;
  });
  return stats;
};

// Function to add a new template dynamically
export const addTemplate = (newTemplate) => {
  console.log('Adding template:', newTemplate);
  
  if (!newTemplate || !newTemplate.id) {
    throw new Error('Template must have an id');
  }
  
  // Validate the template
  console.log('Validating template...');
  const isValid = validateTemplate(newTemplate);
  console.log('Template validation result:', isValid);
  
  if (!isValid) {
    console.log('Template validation failed. Template structure:', newTemplate);
    throw new Error('Invalid template format');
  }
  
  // Add the template to the TEMPLATES object
  TEMPLATES[newTemplate.id] = newTemplate;
  console.log('Template added to TEMPLATES object');
  
  // Update category count
  const category = CATEGORIES[newTemplate.category.toUpperCase()];
  if (category) {
    category.templateCount = (category.templateCount || 0) + 1;
    console.log('Category count updated for:', newTemplate.category);
  }
  
  // Save to localStorage for persistence
  saveUserTemplates();
  console.log('Template saved to localStorage');
  
  return newTemplate;
};

// Function to save user templates to localStorage
const saveUserTemplates = () => {
  try {
    // Get all user-published templates (those with user_ prefix)
    const userTemplates = Object.entries(TEMPLATES)
      .filter(([key, template]) => key.startsWith('user_'))
      .reduce((acc, [key, template]) => {
        acc[key] = template;
        return acc;
      }, {});
    
    localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
  } catch (error) {
    console.error('Error saving user templates:', error);
  }
};

// Function to load user templates from localStorage
const loadUserTemplates = () => {
  try {
    const savedTemplates = localStorage.getItem('userTemplates');
    if (savedTemplates) {
      const userTemplates = JSON.parse(savedTemplates);
      
      // Add user templates to TEMPLATES object
      Object.entries(userTemplates).forEach(([key, template]) => {
        TEMPLATES[key] = template;
      });
      
      // Update category counts
      Object.values(userTemplates).forEach(template => {
        const category = CATEGORIES[template.category.toUpperCase()];
        if (category) {
          category.templateCount = (category.templateCount || 0) + 1;
        }
      });
    }
  } catch (error) {
    console.error('Error loading user templates:', error);
  }
};

// Load user templates when the module is imported
loadUserTemplates();

// Function to clear all user templates (for testing)
export const clearUserTemplates = () => {
  try {
    // Remove user templates from TEMPLATES object
    Object.keys(TEMPLATES).forEach(key => {
      if (key.startsWith('user_')) {
        delete TEMPLATES[key];
      }
    });
    
    // Clear from localStorage
    localStorage.removeItem('userTemplates');
    
    // Reset category counts
    Object.values(CATEGORIES).forEach(category => {
      category.templateCount = getTemplatesByCategory(category.id).length;
    });
    
    console.log('User templates cleared');
  } catch (error) {
    console.error('Error clearing user templates:', error);
  }
};
