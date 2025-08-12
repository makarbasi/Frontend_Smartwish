import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faHeart, faEye } from '@fortawesome/free-solid-svg-icons';
import '../styles/PublishedDesignsGallery.css';
import { getApiUrl, API_ENDPOINTS, logApiConfig } from '../utils/apiConfig';

const PublishedDesignsGallery = ({ onTemplateClick, activeCategory = 'all', refreshTrigger = 0 }) => {
  const { authenticatedFetch } = useAuth();
  const { t } = useLanguage();
  const [publishedDesigns, setPublishedDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('PublishedDesignsGallery: Refresh trigger changed to:', refreshTrigger);
    loadPublishedDesigns();
  }, [refreshTrigger]); // Reload when refreshTrigger changes

  const loadPublishedDesigns = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Log API configuration for debugging
      logApiConfig();
      
      // Use centralized API configuration
      const apiUrl = getApiUrl(API_ENDPOINTS.PUBLISHED_DESIGNS);
      console.log('PublishedDesignsGallery: Loading from API:', apiUrl);
      console.log('PublishedDesignsGallery: Refresh trigger value:', refreshTrigger);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('PublishedDesignsGallery: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('PublishedDesignsGallery: Loaded designs:', data);
        console.log('PublishedDesignsGallery: Number of designs loaded:', data.length);
        if (data.length > 0) {
          console.log('PublishedDesignsGallery: First design sample:', data[0]);
        }
        setPublishedDesigns(data);
      } else {
        console.error('PublishedDesignsGallery: Failed to load, status:', response.status);
        const errorText = await response.text();
        console.error('PublishedDesignsGallery: Error response:', errorText);
        throw new Error('Failed to load published designs');
      }
    } catch (err) {
      console.error('PublishedDesignsGallery: Error loading published designs:', err);
      setError('Failed to load community designs');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (design) => {
    console.log('PublishedDesignsGallery: handleTemplateClick called with design:', design);
    console.log('PublishedDesignsGallery: design.designData:', design.designData);
    console.log('PublishedDesignsGallery: design.designData?.pages:', design.designData?.pages);
    
    // Validate that the design has the required data
    if (!design.designData || !design.designData.pages) {
      console.error('PublishedDesignsGallery: Design missing required data:', {
        hasDesignData: !!design.designData,
        hasPages: !!(design.designData?.pages),
        designData: design.designData
      });
      return; // Don't proceed if data is missing
    }
    
    // Convert published design to template format
    const template = {
      id: design.id,
      title: design.title,
      content: design.description,
      category: design.category,
      author: design.author,
      upload_time: design.upload_time,
      price: design.price || 0,
      language: design.language || 'en',
      region: design.region || 'US',
      popularity: design.popularity || 0,
      num_downloads: design.num_downloads || 0,
      searchKeywords: design.searchKeywords || [],
      pages: design.designData.pages,
      // Add metadata to identify this as a published design
      isPublishedDesign: true,
      originalDesignData: design.designData
    };
    
    console.log('PublishedDesignsGallery: Created template:', template);
    onTemplateClick(template);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter designs by category if specified
  console.log('PublishedDesignsGallery: Filtering designs - activeCategory:', activeCategory);
  console.log('PublishedDesignsGallery: publishedDesigns length:', publishedDesigns.length);
  console.log('PublishedDesignsGallery: publishedDesigns:', publishedDesigns);
  
  // Handle null/undefined activeCategory as 'all'
  const effectiveCategory = activeCategory || 'all';
  console.log('PublishedDesignsGallery: effectiveCategory:', effectiveCategory);
  
  // Always show all published designs, but highlight the current category if one is selected
  const filteredDesigns = publishedDesigns;
  
  console.log('PublishedDesignsGallery: filteredDesigns length:', filteredDesigns.length);
  console.log('PublishedDesignsGallery: filteredDesigns:', filteredDesigns);

  if (loading) {
    return (
      <div className="published-designs-gallery">
        <div className="gallery-header">
          <h2>Community Designs</h2>
          <p>Discover amazing designs created by our community</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading community designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="published-designs-gallery">
        <div className="gallery-header">
          <h2>Community Designs</h2>
          <p>Discover amazing designs created by our community</p>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadPublishedDesigns} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (filteredDesigns.length === 0) {
    console.log('PublishedDesignsGallery: No designs to display, showing empty state');
    return (
      <div className="published-designs-gallery">
        <div className="gallery-header">
          <h2>Community Designs</h2>
          <p>Discover amazing designs created by our community</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <h3>No designs found</h3>
          <p>
            {activeCategory === 'all' 
              ? 'Be the first to publish a design and share it with the community!'
              : `No ${activeCategory} designs have been published yet.`
            }
          </p>
        </div>
      </div>
    );
  }

  console.log('PublishedDesignsGallery: About to render designs grid with', filteredDesigns.length, 'designs');
  console.log('PublishedDesignsGallery: Filtered designs:', filteredDesigns);

  console.log('PublishedDesignsGallery: Rendering main gallery component');
  return (
    <div className="published-designs-gallery">
      <div className="gallery-header">
        <h2>Community Designs</h2>
        <p>Discover amazing designs created by our community</p>
        {effectiveCategory !== 'all' && (
          <div className="category-filter-info">
            <span className="current-category">Showing designs for: <strong>{effectiveCategory}</strong></span>
            <button 
              className="show-all-button"
              onClick={() => window.location.reload()}
            >
              Show All Categories
            </button>
          </div>
        )}
        <div className="gallery-stats">
          <span>{filteredDesigns.length} designs available</span>
          <button 
            onClick={loadPublishedDesigns} 
            className="refresh-button"
            title="Refresh community designs"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="designs-grid">
        {console.log('PublishedDesignsGallery: Starting to map over designs')}
        {filteredDesigns.map((design, index) => {
          console.log(`PublishedDesignsGallery: Rendering design ${index + 1}:`, design.id);
          return (
            <div 
              key={design.id} 
              className="design-card"
              onClick={() => handleTemplateClick(design)}
            >
            <div className="design-thumbnail">
              {/* Debug logging */}
              {console.log('PublishedDesignsGallery: Rendering thumbnail for design:', design.id)}
              {console.log('PublishedDesignsGallery: design.imageUrls:', design.imageUrls)}
              {console.log('PublishedDesignsGallery: design.designData:', design.designData)}
              {console.log('PublishedDesignsGallery: design.designData.pages:', design.designData?.pages)}
              {console.log('PublishedDesignsGallery: design.designData.editedPages:', design.designData?.editedPages)}
              {console.log('PublishedDesignsGallery: design.designData.pages[0]:', design.designData?.pages?.[0])}
              
              {design.imageUrls && design.imageUrls.length > 0 ? (
                <div 
                  className="card-preview"
                  style={{
                    backgroundImage: `url(${design.imageUrls[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="card-preview-overlay">
                    <div className="card-preview-content">
                      <h4>{design.title}</h4>
                      <p>{design.description ? design.description.substring(0, 120) : 'No description provided'}</p>
                      <div className="image-count">
                        {design.imageUrls.length} page{design.imageUrls.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ) : design.designData?.pages && design.designData.pages.length > 0 ? (
                <div 
                  className="card-preview"
                  style={{
                    backgroundImage: `url(${design.designData.editedPages?.[0] || design.designData.pages[0]?.image || design.designData.pages[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="card-preview-overlay">
                    <div className="card-preview-content">
                      <h4>{design.title}</h4>
                      <p>{design.description ? design.description.substring(0, 120) : 'No description provided'}</p>
                      <div className="template-preview">Template Preview</div>
                    </div>
                  </div>
                </div>
              ) : design.thumbnail ? (
                <div 
                  className="card-preview"
                  style={{
                    backgroundImage: `url(${design.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="card-preview-overlay">
                    <div className="card-preview-content">
                      <h4>{design.title}</h4>
                      <p>{design.description ? design.description.substring(0, 120) : 'No description provided'}</p>
                      <div className="template-preview">Thumbnail</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="placeholder-thumbnail">
                  <span>📄</span>
                  <div style={{fontSize: '12px', marginTop: '8px', color: '#6c757d'}}>
                    No preview available
                  </div>
                  <div style={{fontSize: '10px', marginTop: '4px', color: '#adb5bd'}}>
                    Design has {design.designData?.pages?.length || 0} pages
                  </div>
                </div>
              )}
            </div>

            <div className="design-info">
              <h3>{design.title}</h3>
              <p className="design-description">{design.description}</p>
              <div className="design-meta">
                <span className="design-category">{design.category}</span>
                <span className="design-author">by {design.author}</span>
              </div>
              <div className="design-stats">
                <span className="design-date">{formatDate(design.upload_time)}</span>
                <div className="design-engagement">
                  <span className="downloads">
                    <FontAwesomeIcon icon={faDownload} />
                    {design.num_downloads || 0}
                  </span>
                  <span className="popularity">
                    <FontAwesomeIcon icon={faHeart} />
                    {design.popularity || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="design-actions">
              <button className="use-template-button">
                <FontAwesomeIcon icon={faEye} />
                <span>Use Template</span>
              </button>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default PublishedDesignsGallery;