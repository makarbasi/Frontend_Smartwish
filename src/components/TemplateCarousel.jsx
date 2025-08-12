import React, { useState, useEffect, useRef } from 'react';
import "../styles/TemplateCarousel.css";
import TemplateRibbon from './TemplateRibbon';

const TemplateCarousel = ({ templates, templatesData, onTemplateClick, activeTemplate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate how many templates to show based on screen size
  const [templatesToShow, setTemplatesToShow] = useState(4);

  // Drag refs
  const trackRef = useRef(null);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);

  useEffect(() => {
    const updateTemplatesToShow = () => {
      if (window.innerWidth < 768) {
        setTemplatesToShow(2);
      } else if (window.innerWidth < 1024) {
        setTemplatesToShow(3);
      } else {
        setTemplatesToShow(4);
      }
    };

    updateTemplatesToShow();
    window.addEventListener('resize', updateTemplatesToShow);
    return () => window.removeEventListener('resize', updateTemplatesToShow);
  }, []);

  // Update current index when active template changes
  useEffect(() => {
    const activeIndex = templates.findIndex(template => template === activeTemplate);
    if (activeIndex !== -1) {
      setCurrentIndex(Math.floor(activeIndex / templatesToShow) * templatesToShow);
    }
  }, [activeTemplate, templates, templatesToShow]);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const maxIndex = Math.max(0, templates.length - templatesToShow);
    setCurrentIndex(prev => Math.min(prev + templatesToShow, maxIndex));
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => Math.max(prev - templatesToShow, 0));
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const canGoNext = currentIndex + templatesToShow < templates.length;
  const canGoPrev = currentIndex > 0;

  const visibleTemplates = templates.slice(currentIndex, currentIndex + templatesToShow);

  // Drag handlers
  const handleDragStart = (e) => {
    setIsDragging(true);
    dragStartX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    dragCurrentX.current = dragStartX.current;
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    dragCurrentX.current = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const dragDistance = dragCurrentX.current - dragStartX.current;
    
    // Prevent default to avoid text selection
    if (e.type === 'touchmove') {
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    const dragDistance = dragCurrentX.current - dragStartX.current;
    const threshold = 50; // Minimum distance to trigger slide change
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0 && canGoPrev) {
        // Dragged right - go to previous
        prevSlide();
      } else if (dragDistance < 0 && canGoNext) {
        // Dragged left - go to next
        nextSlide();
      }
    }
  };

  // Add event listeners for drag
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener('mousedown', handleDragStart);
    track.addEventListener('touchstart', handleDragStart, { passive: false });
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      track.removeEventListener('mousedown', handleDragStart);
      track.removeEventListener('touchstart', handleDragStart);
      
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
      
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, canGoNext, canGoPrev]);

  return (
    <div className="template-carousel">
      <div className="carousel-container">
        {/* Previous Button */}
        <button 
          className={`carousel-button carousel-button-prev ${!canGoPrev ? 'disabled' : ''}`}
          onClick={canGoPrev ? prevSlide : undefined}
          aria-label="Previous templates"
          disabled={!canGoPrev}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Templates */}
        <div 
          className={`carousel-track ${isDragging ? 'dragging' : ''}`}
          ref={trackRef}
        >
          {visibleTemplates.map((templateKey) => {
            const templateData = templatesData[templateKey];
            return (
              <div
                key={templateKey}
                className={`carousel-item ${activeTemplate === templateKey ? 'active' : ''}`}
                onClick={() => {
                  if (!isDragging) {
                    onTemplateClick(templateKey);
                  }
                }}
              >
                                <div className="template-card">
                  <div className="template-image-container">
                    <img 
                      src={`images/${templateKey}.jpg`} 
                      alt={templateData?.title || templateKey}
                      className="template-image"
                      onError={(e) => {
                        // Try .png if .jpg fails
                        if (e.target.src.endsWith('.jpg')) {
                          e.target.src = `images/${templateKey}.png`;
                        } else if (e.target.src.endsWith('.png')) {
                          // If both .jpg and .png fail, use a fallback image
                          e.target.src = 'images/blank.jpg';
                        }
                      }}
                    />
                    {/* Template Ribbon with detailed stats */}
                    {templateData && (
                      <TemplateRibbon template={templateData} />
                    )}
                    <div className="template-overlay">
                      <div className="template-preview-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="template-overlay-text">
                        <span>Click to Preview</span>
                      </div>
                    </div>
                  </div>
                  <div className="template-content">
                    <h3 className="template-title">{templateData?.title || templateKey}</h3>
                    <p className="template-description">{templateData?.description || 'Beautiful greeting card template'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <button 
          className={`carousel-button carousel-button-next ${!canGoNext ? 'disabled' : ''}`}
          onClick={canGoNext ? nextSlide : undefined}
          aria-label="Next templates"
          disabled={!canGoNext}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {Array.from({ length: Math.ceil(templates.length / templatesToShow) }).map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${Math.floor(currentIndex / templatesToShow) === index ? 'active' : ''}`}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(index * templatesToShow);
              setTimeout(() => setIsTransitioning(false), 300);
            }}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateCarousel; 