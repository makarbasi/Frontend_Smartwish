import React, { useState, useEffect, useRef } from 'react';
import './styles/App.css';
import './styles/SearchBar.css';
// import MicrophoneReader from './components/mic.jsx';
import Header from './components/Headers.jsx';
import Footer from './components/Footer.jsx';
import FlipBook from './components/flipbook.jsx';
import FlipbookModal from './components/FlipbookModal.jsx';
import MediaUploadModal from './components/MediaUploadModal.jsx';
import CategoryCarousel from './components/CategoryCarousel.jsx';
import TemplateCarousel from './components/TemplateCarousel.jsx';
import SearchBar from './components/SearchBar.jsx';
import LoginForm from './components/LoginForm.jsx';
import SignupForm from './components/SignupForm.jsx';
import Profile from './components/Profile.jsx';
import EnvironmentDebug from './components/EnvironmentDebug.jsx';
import PrinterSelectionModal from './components/PrinterSelectionModal.jsx';
import SavedDesigns from './components/SavedDesigns.jsx';
import ShareCardModal from './components/ShareCardModal.jsx';
import SaveDesignModal from './components/SaveDesignModal.jsx';
import SavePreviewModal from './components/SavePreviewModal.jsx';
import Contacts from './components/Contacts.jsx';
import Calendar from './components/Calendar.jsx';
import Marketplace from './components/Marketplace.jsx';
import TemplateRibbon from './components/TemplateRibbon.jsx';
import PublishedDesignsGallery from './components/PublishedDesignsGallery.jsx';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider, useLanguage } from './hooks/LanguageContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { translations } from './utils/translations.js';
import { getApiBaseUrl, logApiConfig } from './utils/apiConfig.js';

// Import data provider
import dataProvider from './services/dataProvider.js';
import templateService from './services/templateService.js';
import { addTemplate, clearUserTemplates, TEMPLATES } from './utils/templatesWrapper.js';

// Debug function for browser console
window.debugTemplates = async () => {
  console.log('🔍 Debugging Template Loading...');
  
  try {
    if (!dataProvider) {
      console.log('❌ DataProvider not initialized');
      return;
    }

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
      console.log('Birthday mapping templates:', birthdayMapping);
    }
    
    // Step 8: Check user templates
    console.log('\n📋 Step 8: Checking user templates...');
    const userTemplates = allTemplates.filter(t => t.id.startsWith('user_'));
    console.log('✅ User templates found:', userTemplates.length);
    console.log('User template IDs:', userTemplates.map(t => t.id));
    console.log('User template titles:', userTemplates.map(t => t.title));
    
    // Step 9: Check localStorage
    console.log('\n📋 Step 9: Checking localStorage...');
    const savedTemplates = localStorage.getItem('userTemplates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      console.log('✅ User templates in localStorage:', Object.keys(parsed));
    } else {
      console.log('❌ No user templates in localStorage');
    }
    
    // Add debug functions to window
    window.clearUserTemplates = clearUserTemplates;
    window.debugUserTemplates = () => {
      console.log('User templates in memory:', Object.keys(TEMPLATES).filter(k => k.startsWith('user_')));
      console.log('User templates in localStorage:', localStorage.getItem('userTemplates'));
    };
    window.checkPublishedTemplates = () => {
      console.log('Checking published templates...');
      const userTemplates = Object.keys(TEMPLATES).filter(k => k.startsWith('user_'));
      console.log('User templates:', userTemplates);
      userTemplates.forEach(id => {
        console.log(`Template ${id}:`, TEMPLATES[id]);
      });
    };
    
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
};

// Additional debug function to check dataProvider directly
window.debugDataProvider = async () => {
  console.log('🔍 Debugging DataProvider directly...');
  
  try {
    if (!dataProvider) {
      console.log('❌ DataProvider not initialized');
      return;
    }

    console.log('✅ DataProvider is initialized');
    
    // Check what templates are returned by getLocalTemplates
    console.log('\n📋 Checking getLocalTemplates...');
    const localTemplates = dataProvider.getLocalTemplates();
    console.log('Local templates count:', localTemplates.length);
    console.log('Local template IDs:', localTemplates.map(t => t.id));
    
    // Check what templates are returned by getTemplates
    console.log('\n📋 Checking getTemplates...');
    const allTemplates = await dataProvider.getTemplates();
    console.log('All templates count:', allTemplates.length);
    console.log('All template IDs:', allTemplates.map(t => t.id));
    
    // Check the imported getAllTemplates function
    console.log('\n📋 Checking imported getAllTemplates...');
    console.log('Skipping dynamic import to avoid HTTP request issues');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error stack:', error.stack);
  }
};

// Utility function to get base URL based on environment
// This is now a wrapper around the centralized API configuration
const getBaseUrl = () => {
  return getApiBaseUrl();
};

const AppContent = () => {
  const { t } = useLanguage();
  const { user, loading, logout, forceLogout } = useAuth();
  
  // Remove the old authentication state
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [showAuthForm, setShowAuthForm] = useState('login'); // 'login' or 'signup'
  
  const [activeCard, setActiveCard] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFlipBook, setShowFlipBook] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState({ title: '', content: '', pages: [] }); // Default empty array for pages
  const [editedPages, setEditedPages] = useState({});
  const [currentTemplateKey, setCurrentTemplateKey] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [mediaQRCode, setMediaQRCode] = useState(null);
  const [showMediaUploadModal, setShowMediaUploadModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showPrinterSelectionModal, setShowPrinterSelectionModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showSavedDesigns, setShowSavedDesigns] = useState(false);
  const [showShareCardModal, setShowShareCardModal] = useState(false);
  const [designToShare, setDesignToShare] = useState(null);
  const [showSaveDesignModal, setShowSaveDesignModal] = useState(false);
  const [showSavePreviewModal, setShowSavePreviewModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showCommunityGallery, setShowCommunityGallery] = useState(true);
  const [communityGalleryRefreshTrigger, setCommunityGalleryRefreshTrigger] = useState(0);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [editingDesign, setEditingDesign] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Dynamic data from data provider
  const [imageCards, setImageCards] = useState({});
  const [categories, setCategories] = useState([]);
  const [cardTitles, setCardTitles] = useState({});
  const [activeTemplate, setActiveTemplate] = useState(null);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleScannerClick = () => {
    setShowScanner(true);
  };





  const stopScanner = () => {
    setShowScanner(false);
  };

  const handleQRCodeDetected = async (code) => {
    try {
      setShowScanner(false);

      // Check if it's a media QR code (contains /add-media/)
      if (code.includes('/add-media/')) {
        console.log('Detected media QR code:', code);
        setMediaQRCode(code);
        setShowMediaUploadModal(true);
        return;
      }

      // Handle image QR code (for loading flipbooks)
      // Extract the timestamp from the QR code
      const timestamp = code.split('/').pop();
      console.log('Loading images for timestamp:', timestamp);

      // Fetch the images
      const response = await fetch(`${getBaseUrl()}/load-images/${timestamp}`);
      if (!response.ok) {
        throw new Error('Failed to load images');
      }

      const result = await response.json();
      console.log('Received files:', result.files);

      if (!result.files || result.files.length === 0) {
        throw new Error('No images found');
      }

      // Create new pages with the loaded images
      const newPages = result.files.map((file, index) => ({
        header: `Page ${index + 1}`,
        image: `${getBaseUrl()}${file.url}`,
        text: '',
        footer: `${index + 1}`
      }));

      console.log('Created new pages:', newPages);

      // Update the selected template with new pages
      setSelectedTemplate(prev => ({
        ...prev,
        pages: newPages
      }));

      // Show the flipbook
      setShowFlipBook(true);

      console.log('Images loaded successfully!');
    } catch (error) {
      console.error('Error loading images:', error);
      console.error(error.message || 'Failed to load images');
    }
  };

  useEffect(() => {
    let interval;
    if (showScanner && webcamRef.current && canvasRef.current) {
      interval = setInterval(() => {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            handleQRCodeDetected(code.data);
          }
        }
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showScanner]);

  useEffect(() => {
    const allImages = Object.values(imageCards).flat();
    allImages.forEach(image => {
      const img = new Image();
      img.src = `images/${image}.jpg`;
    });
  }, [imageCards]); // Dependency array correctly uses imageCards

  // Import centralized template service
  const templateServiceInstance = React.useMemo(() => {
    return templateService;
  }, []);

  // Template data will be loaded from the centralized system
  const [templatesData, setTemplatesData] = useState({});
  const [categoriesData, setCategoriesData] = useState([]);

  // Load templates and categories on component mount
  useEffect(() => {
    const loadTemplateData = async () => {
      try {
        console.log('🔄 Loading template data...');
        
        // Use static import instead of dynamic import
        // dataProvider is already imported as a singleton instance
        console.log('✅ DataProvider imported:', dataProvider);
        
        // Load all data in parallel
        const [templates, categories, imageCardsMapping, categoriesForCarousel] = await Promise.all([
          dataProvider.getTemplatesData(),
          dataProvider.getCategories(),
          dataProvider.getImageCardsMapping(),
          dataProvider.getCategoriesForCarousel()
        ]);

        console.log('📊 Data loaded:');
        console.log('- Templates count:', Object.keys(templates).length);
        console.log('- Categories count:', categories.length);
        console.log('- Image cards mapping keys:', Object.keys(imageCardsMapping));
        console.log('- Categories for carousel count:', categoriesForCarousel.length);

        // Set templates data
        setTemplatesData(templates);
        setCategoriesData(categories);

        // Set dynamic categories and image cards
        setCategories(categoriesForCarousel);
        setImageCards(imageCardsMapping);

        // Create card titles mapping
        const titlesMapping = {};
        categoriesForCarousel.forEach(category => {
          titlesMapping[category.id] = category.title;
        });
        setCardTitles(titlesMapping);

        console.log('✅ Template data loading completed');

      } catch (error) {
        console.error('❌ Failed to load template data:', error);
        // Simple fallback - will be replaced by data provider
        setTemplatesData({});
        setCategoriesData([]);
        setCategories([]);
        setImageCards({});
        setCardTitles({});
      }
    };

    loadTemplateData();
  }, []);

  const handleTemplateClick = (templateKey) => {
    setSelectedTemplate(templatesData[templateKey]);
    setCurrentTemplateKey(templateKey);
    setActiveTemplate(templateKey); // Set active template for carousel
    setShowFlipBook(true);
  };

  const handlePublishedDesignClick = (template) => {
    console.log('App.jsx: handlePublishedDesignClick called with template:', template);
    // Set the selected template directly since it's already in the correct format
    setSelectedTemplate(template);
    // Generate a unique key for this published design
    const publishedDesignKey = `published-${template.id}`;
    setCurrentTemplateKey(publishedDesignKey);
    setActiveTemplate(null); // No active template for published designs
    setShowFlipBook(true);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearchMode(results.length > 0);
    
    // If only one result, automatically select it
    if (results.length === 1) {
      const templateKey = results[0].key;
      if (templatesData[templateKey]) {
        setSelectedTemplate(templatesData[templateKey]);
        setCurrentTemplateKey(templateKey);
        setShowFlipBook(true);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearchMode(false);
    setActiveTemplate(null); // Reset active template when clearing search
  };

  const generateMediaQRCode = async () => {
    // First, check if there's already a QR code on the last page
    const lastPageIndex = selectedTemplate.pages.length - 1;
    const lastPageImage = editedPages[currentTemplateKey]?.[lastPageIndex] || selectedTemplate.pages[lastPageIndex].image;
    
    // Try to detect existing QR code from the last page
    const existingQRCode = await detectQRCodeFromImage(lastPageImage);
    
    if (existingQRCode) {
      console.log(t('foundExistingQRCode'), existingQRCode);
      setMediaQRCode(existingQRCode);
      // Open media upload modal directly without generating new QR code
      setShowMediaUploadModal(true);
      return;
    }
    
    // Generate a new QR code only if none exists
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const qrValue = `${getBaseUrl()}/add-media/${timestamp}-${uniqueId}`;
    setMediaQRCode(qrValue);
    
    // Create a canvas to combine the last page image with the QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1000;
    
    // Load the background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      // Draw the background image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(qrValue, {
          width: 150,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Load QR code as image
        const qrImg = new Image();
        qrImg.onload = () => {
          // Draw QR code on the canvas - centered at bottom, smaller and higher
          const qrSize = 80; // Smaller QR code
          const qrX = (canvas.width - qrSize) / 2; // Center horizontally
          const qrY = canvas.height - qrSize - 180; // Position higher to avoid logo
          
          // Draw QR code
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          
          // Add text below QR code with SmartWish brand colors
          ctx.fillStyle = '#2E86AB'; // SmartWish blue color
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(t('scanToPlayMedia'), canvas.width / 2, qrY + qrSize + 20);
          
          // Convert canvas to data URL and update the last page
          const updatedImageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setEditedPages(prev => ({
            ...prev,
            [currentTemplateKey]: {
              ...prev[currentTemplateKey],
              [lastPageIndex]: updatedImageDataUrl
            }
          }));
          
          // Open media upload modal
          setShowMediaUploadModal(true);
        };
        
        qrImg.src = qrDataUrl;
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Fallback to placeholder if QR code generation fails
        const qrSize = 80; // Smaller size to match
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = canvas.height - qrSize - 180; // Position higher to avoid logo
        
        // Draw placeholder with SmartWish colors
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrX, qrY, qrSize, qrSize);
        ctx.strokeStyle = '#2E86AB'; // SmartWish blue
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX, qrY, qrSize, qrSize);
        
        // Add placeholder text
        ctx.fillStyle = '#2E86AB'; // SmartWish blue
        ctx.font = 'bold 10px Arial'; // Smaller font for smaller QR code
        ctx.textAlign = 'center';
        ctx.fillText(t('qrCode'), canvas.width / 2, qrY + qrSize / 2 - 10);
        ctx.fillText(t('forMedia'), canvas.width / 2, qrY + qrSize / 2 + 10);
        
        // Add text below placeholder
        ctx.fillStyle = '#2E86AB'; // SmartWish blue color
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t('scanToPlayMedia'), canvas.width / 2, qrY + qrSize + 20);
        
        // Convert canvas to data URL and update the last page
        const updatedImageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setEditedPages(prev => ({
          ...prev,
          [currentTemplateKey]: {
            ...prev[currentTemplateKey],
            [lastPageIndex]: updatedImageDataUrl
          }
        }));
        
        // Open media upload modal
        setShowMediaUploadModal(true);
      }
    };
    
    img.src = lastPageImage;
  };

  const generateMediaQRCodeForCard = async (design) => {
    // Generate a QR code specifically for this saved card
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const qrValue = `${getBaseUrl()}/add-media/${timestamp}-${uniqueId}`;
    setMediaQRCode(qrValue);
    
    // Store the design ID with the QR code for reference
    // This could be used to associate media with specific cards
    console.log('Generated media QR code for card:', design.id, qrValue);
  };

  // Function to detect QR code from an image
  const detectQRCodeFromImage = async (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for QR code detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Try to detect QR code using jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code && code.data) {
          // Check if it's a media QR code (contains /add-media/)
          if (code.data.includes('/add-media/')) {
            resolve(code.data);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => {
        resolve(null);
      };
      
      img.src = imageSrc;
    });
  };
  
  const handleMediaUploadSuccess = (result) => {
    console.log('Media uploaded successfully!');
    console.log('Media upload result:', result);
    
    // Close media upload modal
    setShowMediaUploadModal(false);
    
    // On mobile, show QR code for sharing with kiosk
    if (isMobile && qrCodeValue) {
      setShowQRCodeModal(true);
    }
  };

  const handleCardClick = async (cardId) => {
    if (activeCard === cardId) {
      // Toggle template visibility if the same card is clicked
      setShowTemplates(prev => !prev);
    } else {
      // Clicked a new card - get templates for this category
      try {
        // Check if dataProvider is initialized
        if (!dataProvider) {
          console.warn('DataProvider not initialized, using fallback');
          setTemplates(imageCards[cardId] || []);
          setActiveCard(cardId);
          setActiveTemplate(null);
          setShowTemplates(true);
          return;
        }

        // Get the category ID from the card mapping
        const categoryMapping = await dataProvider.getCategoryMapping();
        const categoryId = categoryMapping[cardId];
        
        console.log('Category mapping:', categoryMapping);
        console.log('Card ID:', cardId);
        console.log('Category ID:', categoryId);
        
        if (categoryId) {
          // Get all templates for this category using the data provider
          const categoryTemplates = await dataProvider.getTemplatesByCategory(categoryId);
          
          console.log('Category templates:', categoryTemplates);
          console.log('Template count:', categoryTemplates.length);
          
          // Use the actual template IDs directly
          const templateKeys = categoryTemplates.map(template => template.id);
          
          console.log('Template keys:', templateKeys);
          
          setTemplates(templateKeys);
          setActiveCard(cardId);
          setActiveTemplate(null); // Reset active template when switching categories
          setShowTemplates(true); // Show templates for the new category
        } else {
          console.warn('Category ID not found, using fallback');
          // Fallback to old method if category mapping fails
          setTemplates(imageCards[cardId] || []);
          setActiveCard(cardId);
          setActiveTemplate(null);
          setShowTemplates(true);
        }
      } catch (error) {
        console.error('Error loading templates for category:', error);
        // Fallback to old method
        setTemplates(imageCards[cardId] || []);
        setActiveCard(cardId);
        setActiveTemplate(null);
        setShowTemplates(true);
      }
    }
  };

  const handlePrint = async () => {
    if (isMobile) {
      // Mobile flow: Directly proceed with printing (QR code generation)
      await proceedWithPrint(true, true);
    } else {
      // Desktop flow: Show printer selection modal first
      setShowPrinterSelectionModal(true);
    }
  };

  const handlePrinterSelect = async (printerName) => {
    // Proceed with printing using the selected printer
    await proceedWithPrint(true, true, printerName);
  };

  const proceedWithPrint = async (showQRCodeImmediately = true, showSuccessNotification = true, printerName = null) => {
    if (isMobile) {
      try {
        setIsPrinting(true);
        
        // Get all pages from the flipbook
        const pages = selectedTemplate.pages;
        const imagesToSave = [];

        // For each page, get either the edited image or the original image
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          let imageData;

          if (editedPages[currentTemplateKey]?.[i]) {
            // Use edited image if available
            imageData = editedPages[currentTemplateKey][i];
          } else {
            // Use original image
            imageData = page.image;
          }

          // If it's a base64 image, use it directly
          if (imageData.startsWith('data:image')) {
            imagesToSave.push(imageData);
          } else if (imageData.startsWith('blob:')) {
            // Handle blob URLs - convert to base64
            try {
              const response = await fetch(imageData);
              const blob = await response.blob();
              const reader = new FileReader();
              const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              const base64Data = await base64Promise;
              imagesToSave.push(base64Data);
            } catch (error) {
              console.error(`Error converting blob URL to base64 for page ${i}:`, error);
              // Skip this image if blob URL is invalid
            }
          } else {
            // If it's a file path, convert it to base64
            try {
              const response = await fetch(imageData);
              const blob = await response.blob();
              const reader = new FileReader();
              const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              const base64Data = await base64Promise;
              imagesToSave.push(base64Data);
            } catch (error) {
              console.error(`Error converting image ${i} to base64:`, error);
            }
          }
        }

        if (imagesToSave.length === 0) {
          console.error("No valid images to save");
          return;
        }

        console.log(`Saving ${imagesToSave.length} images...`);

        // Save images to server
        const response = await fetch(`${getBaseUrl()}/save-images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: imagesToSave }),
        });

        const result = await response.json();

        if (response.ok) {
          // Generate QR code value with the timestamp
          const qrValue = `${getBaseUrl()}/load-images/${result.timestamp}`;
          setQrCodeValue(qrValue);
          
          // Show success notification only if showSuccessNotification is true
          if (showSuccessNotification) {
            console.log(t('imagesSavedSuccessfully'));
          }
          
          // Show QR code modal for sharing with kiosk only if showQRCodeImmediately is true
          if (showQRCodeImmediately) {
            setShowQRCodeModal(true);
          }
        } else {
          console.error('Server error:', result);
          console.error(t('failedToSaveImages'));
        }
      } catch (error) {
        console.error('Error saving images:', error);
        console.error(t('errorSavingImages'));
      } finally {
        setIsPrinting(false);
      }
    } else {
      // Desktop flow: Print using PC printing endpoint
      try {
        setIsPrinting(true);
        
        // Get all pages from the flipbook
        const pages = selectedTemplate.pages;
        const imagesToSave = [];

        // For each page, get either the edited image or the original image
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          let imageData;

          if (editedPages[currentTemplateKey]?.[i]) {
            // Use edited image if available
            imageData = editedPages[currentTemplateKey][i];
          } else {
            // Use original image
            imageData = page.image;
          }

          // If it's a base64 image, use it directly
          if (imageData.startsWith('data:image')) {
            imagesToSave.push(imageData);
          } else if (imageData.startsWith('blob:')) {
            // Handle blob URLs - convert to base64
            try {
              const response = await fetch(imageData);
              const blob = await response.blob();
              const reader = new FileReader();
              const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              const base64Data = await base64Promise;
              imagesToSave.push(base64Data);
            } catch (error) {
              console.error(`Error converting blob URL to base64 for page ${i}:`, error);
              // Skip this image if blob URL is invalid
            }
          } else {
            // If it's a file path, convert it to base64
            try {
              const response = await fetch(imageData);
              const blob = await response.blob();
              const reader = new FileReader();
              const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
              const base64Data = await base64Promise;
              imagesToSave.push(base64Data);
            } catch (error) {
              console.error(`Error converting image ${i} to base64:`, error);
            }
          }
        }

        if (imagesToSave.length === 0) {
          console.error("No valid images to print");
          return;
        }

        console.log(`Printing ${imagesToSave.length} images on PC to printer: ${printerName}...`);

        // Submit print job to queue instead of direct printing
        const response = await fetch(`${getBaseUrl()}/submit-print-job`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: imagesToSave, printerName }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(t('printJobSubmittedSuccessfully'));
          console.log("Print job submitted:", result);
          
          // Show success message with job ID
          alert(`${t('printJobSubmittedSuccessfully')}\nJob ID: ${result.jobId}\nStatus: ${result.status}`);
        } else {
          console.error('Print job submission error:', result);
          console.error(t('errorPrinting'));
        }
      } catch (error) {
        console.error('Error printing:', error);
        console.error(t('errorPrinting'));
      } finally {
        setIsPrinting(false);
      }
    }
  };
  
  const handleSaveEditedPage = (pageIndex, newImage) => {
    setEditedPages(prev => ({
      ...prev,
      [currentTemplateKey]: {
        ...(prev[currentTemplateKey] || {}),
        [pageIndex]: newImage
      }
    }));
  };

  const handleSaveDesign = () => {
    if (!currentTemplateKey || !selectedTemplate.pages.length) {
      alert('No card to save. Please select a template first.');
      return;
    }
    // Close the FlipbookModal first so user can see the save preview modal clearly
    setShowFlipBook(false);
    // Show the save preview modal instead of directly showing the save design modal
    // This allows users to choose between creating a new card or replacing an existing one
    setShowSavePreviewModal(true);
  };

  const handleSaveDesignSuccess = (savedDesign) => {
    console.log('Card saved successfully:', savedDesign);
    // Reset editing state
    setEditingDesign(null);
    // Close the FlipbookModal so user can see modals underneath
    setShowFlipBook(false);
    // You could show a success notification here
  };

  const handleUpdateCard = () => {
    if (!currentTemplateKey || !selectedTemplate.pages.length) {
      alert('No card to update. Please select a template first.');
      return;
    }
    setShowSaveDesignModal(true);
  };

  const handleShowSavePreview = () => {
    if (!currentTemplateKey || !selectedTemplate.pages.length) {
      alert('No card to save. Please select a template first.');
      return;
    }
    setShowSavePreviewModal(true);
  };

  const handleSaveAsNew = () => {
    setEditingDesign(null);
    setShowSaveDesignModal(true);
  };

  const handleReplaceCard = (existingCard) => {
    setEditingDesign(existingCard);
    setShowSaveDesignModal(true);
  };

  const handleLoadDesign = (design) => {
    console.log('Loading design:', design);
    
    // Check if we have cloud image URLs
    if (design.imageUrls && design.imageUrls.length > 0) {
      console.log('Loading design with cloud image URLs:', design.imageUrls);
      
      // Create pages with cloud image URLs
      const cloudPages = design.designData.pages.map((page, index) => ({
        ...page,
        // Use cloud URL if available for this page, otherwise fall back to original
        image: design.imageUrls[index] || page.image
      }));
      
      setSelectedTemplate({
        title: design.title,
        content: design.description,
        pages: cloudPages
      });
    } else {
      console.log('Loading design with original template pages');
      // Fallback to original template pages
      setSelectedTemplate({
        title: design.title,
        content: design.description,
        pages: design.designData.pages
      });
    }
    
    setCurrentTemplateKey(design.designData.templateKey);
    
    // Handle edited pages - filter out invalid blob URLs
    const validEditedPages = {};
    if (design.designData.editedPages) {
      Object.entries(design.designData.editedPages).forEach(([pageIndex, imageUrl]) => {
        // Skip blob URLs as they're not valid across sessions
        if (imageUrl && !imageUrl.startsWith('blob:')) {
          validEditedPages[pageIndex] = imageUrl;
        } else {
          console.log(`Skipping invalid blob URL for page ${pageIndex}:`, imageUrl);
        }
      });
    }
    
    setEditedPages(prev => ({
      ...prev,
      [design.designData.templateKey]: validEditedPages
    }));
    
    setEditingDesign(design); // Set the design we're editing
    setShowFlipBook(true);
    setShowTemplates(false);
    setActiveCard(null);
  };

  const handleShowSavedDesigns = () => {
    setShowSavedDesigns(true);
  };

  const handleAddMediaToCard = (design) => {
    // Generate media QR code for this specific card
    generateMediaQRCodeForCard(design);
    setShowMediaUploadModal(true);
  };

  const handleShareCard = (design) => {
    setDesignToShare(design);
    setShowShareCardModal(true);
  };

  const handlePublishDesign = async (publishedDesign) => {
    try {
      console.log('Design published successfully:', publishedDesign);
      
      // Show success message
      alert('Your design has been published successfully! It is now available for others to use.');
      
      // Wait a moment for the backend to process the publish operation
      setTimeout(() => {
        // Refresh the community gallery to show the newly published design
        setCommunityGalleryRefreshTrigger(prev => prev + 1);
        console.log('Triggered community gallery refresh');
      }, 1000);
      
      // Refresh the saved designs to show the updated status
      // The SavedDesigns component will handle this automatically
      
    } catch (error) {
      console.error('Error handling published design:', error);
      alert('There was an error publishing your design. Please try again.');
    }
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  const handleContactsClick = () => {
    setShowContacts(true);
  };

  const handleCalendarClick = () => {
    setShowCalendar(true);
  };

  const handleMarketplaceClick = () => {
    setShowMarketplace(true);
  };

  const handleMarketplaceItemSelect = (item) => {
    console.log('Selected marketplace item:', item);
    // Here you can integrate with the card creation process
    // For now, just log the selected item
  };

  const handleLogin = () => {
    // This is now handled by the AuthContext
  };

  // Show loading while checking authentication
  if (loading) {
    console.log('Auth loading...');
    return <div className="loading">Loading...</div>;
  }

  // Show auth forms if not authenticated
  if (!user) {
    console.log('No user found, showing auth form:', showAuthForm);
    console.log('Environment check - should show auth forms');
    return (
      <div className="auth-page">
        {showAuthForm === 'login' ? (
          <LoginForm onSwitchToSignup={() => setShowAuthForm('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setShowAuthForm('login')} />
        )}
      </div>
    );
  }

  console.log('User authenticated:', user);

  // Add environment debugging
  console.log('Environment:', {
    NODE_ENV: import.meta.env.MODE,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    user: !!user,
    loading
  });

  console.log('VITE_API_URL (build-time):', import.meta.env.VITE_API_URL);

  return (
    <div className="app-wrapper">
      {/* <EnvironmentDebug user={user} loading={loading} showAuthForm={showAuthForm} /> */}
      
      {/* Temporary test button - hidden for production */}
      {/* <button 
        onClick={forceLogout}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          background: 'red',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Clear Auth (Test)
      </button> */}
      
      <Header
        onScannerClick={handleScannerClick}

        onLogout={logout}
        onSaveDesign={handleSaveDesign}
        onShowSavedDesigns={handleShowSavedDesigns}
        onProfileClick={handleProfileClick}
        onContactsClick={handleContactsClick}
        onCalendarClick={handleCalendarClick}
        onMarketplaceClick={handleMarketplaceClick}
        user={user}
        isMobile={isMobile}
      />
      <main className="main-content">
        <div className="container">
          {/* Search Bar */}
          <SearchBar 
            onSearchResults={handleSearchResults}
            onClearSearch={handleClearSearch}
          />

          {/* Replace old image-cards with new CategoryCarousel */}
          {!isSearchMode && (
            <CategoryCarousel
              categories={categories}
              activeCategory={activeCard}
              onCategoryClick={handleCardClick}
            />
          )}



          {showTemplates && templates.length > 0 && (
            <TemplateCarousel
              templates={templates}
              templatesData={templatesData}
              onTemplateClick={handleTemplateClick}
              activeTemplate={activeTemplate}
            />
          )}

          {/* Community Published Designs Gallery */}
          {!isSearchMode && showCommunityGallery && (
            <PublishedDesignsGallery
              onTemplateClick={handlePublishedDesignClick}
              activeCategory={activeCard}
              refreshTrigger={communityGalleryRefreshTrigger}
            />
          )}

          {/* Flipbook Modal */}
          <FlipbookModal
            isOpen={showFlipBook}
            onClose={() => setShowFlipBook(false)}
            onSave={handleSaveDesign}
            title={selectedTemplate.title}
            pages={selectedTemplate.pages}
            editedPages={editedPages[currentTemplateKey] || {}}
            onEditPageSave={handleSaveEditedPage}
            onPrint={handlePrint}
            isPrinting={isPrinting}
            isMobile={isMobile}
            mediaQRCode={mediaQRCode}
          />

          <MediaUploadModal
            isOpen={showMediaUploadModal}
            onClose={() => {
              setShowMediaUploadModal(false);
              // On mobile, show QR code for sharing with kiosk after closing media upload
              if (isMobile && qrCodeValue) {
                setShowQRCodeModal(true);
              }
            }}
            onMediaUpload={handleMediaUploadSuccess}
            qrCodeValue={mediaQRCode}
          />



          <PrinterSelectionModal
            isOpen={showPrinterSelectionModal}
            onClose={() => setShowPrinterSelectionModal(false)}
            onPrinterSelect={handlePrinterSelect}
            isPrinting={isPrinting}
          />

          {showSavedDesigns && (
            <SavedDesigns
              onLoadDesign={handleLoadDesign}
              onClose={() => setShowSavedDesigns(false)}
              onAddMedia={handleAddMediaToCard}
              onShareCard={handleShareCard}
              onPublishDesign={handlePublishDesign}
            />
          )}

          {showShareCardModal && designToShare && (
            <ShareCardModal
              isOpen={showShareCardModal}
              onClose={() => {
                setShowShareCardModal(false);
                setDesignToShare(null);
              }}
              designId={designToShare.id}
              designTitle={designToShare.title}
            />
          )}

          {showSaveDesignModal && (
            <SaveDesignModal
              designData={{
                templateKey: currentTemplateKey,
                pages: selectedTemplate.pages,
                editedPages: editedPages[currentTemplateKey] || {}
              }}
              onSave={handleSaveDesignSuccess}
              onClose={() => setShowSaveDesignModal(false)}
              isEditing={!!editingDesign}
              existingDesign={editingDesign}
            />
          )}

          {showSavePreviewModal && (
            <SavePreviewModal
              onSaveAsNew={handleSaveAsNew}
              onReplaceCard={handleReplaceCard}
              onClose={() => setShowSavePreviewModal(false)}
            />
          )}

          {showProfile && (
            <Profile
              onClose={() => setShowProfile(false)}
            />
          )}

          {showContacts && (
            <Contacts
              key={`contacts-${Date.now()}`}
              userId={user?.id}
              onClose={() => setShowContacts(false)}
            />
          )}

          {showCalendar && (
            <Calendar
              key={`calendar-${Date.now()}`}
              onClose={() => setShowCalendar(false)}
            />
          )}

          {showMarketplace && (
            <Marketplace
              onClose={() => setShowMarketplace(false)}
              onSelectItem={handleMarketplaceItemSelect}
            />
          )}

          {/* QR Code Modal for Sharing with Kiosk */}
          {showQRCodeModal && qrCodeValue && isMobile && (
            <div className="qr-code-modal">
              <div className="qr-code-content">
                <button
                  className="qr-close-x-btn"
                  onClick={() => setShowQRCodeModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <h3>{t('shareWithKioskTitle')}</h3>
                <p>{t('scanQRCodeKiosk')}</p>
                <div className="qr-code-container">
                  <QRCodeSVG
                    value={qrCodeValue}
                    size={200}
                    level="M"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#2E86AB"
                  />
                </div>
                <div className="qr-code-url">
                  <p>{t('orVisit')}</p>
                  <a href={qrCodeValue} target="_blank" rel="noopener noreferrer">
                    {qrCodeValue}
                  </a>
                </div>
              </div>
            </div>
          )}

          {showScanner && (
            <div className="scanner-modal">
              <div className="scanner-content">
                <h3>{t('scanQRCode')}</h3>
                <div style={{ position: 'relative' }}>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                </div>
                <button onClick={stopScanner} className="close-button">
                  {t('close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer/>
      {/* <ToastContainer /> */}
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;