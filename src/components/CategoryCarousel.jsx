import React, { useState, useEffect, useRef } from 'react';
import "../styles/CategoryCarousel.css";

const CategoryCarousel = ({ categories, activeCategory, onCategoryClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate how many categories to show based on screen size
  const [categoriesToShow, setCategoriesToShow] = useState(4);

  // Drag refs
  const trackRef = useRef(null);
  const dragStartX = useRef(0);
  const dragCurrentX = useRef(0);

  useEffect(() => {
    const updateCategoriesToShow = () => {
      if (window.innerWidth < 768) {
        setCategoriesToShow(2);
      } else if (window.innerWidth < 1024) {
        setCategoriesToShow(3);
      } else {
        setCategoriesToShow(4);
      }
    };

    updateCategoriesToShow();
    window.addEventListener('resize', updateCategoriesToShow);
    return () => window.removeEventListener('resize', updateCategoriesToShow);
  }, []);

  // Update current index when active category changes
  useEffect(() => {
    const activeIndex = categories.findIndex(cat => cat.id === activeCategory);
    if (activeIndex !== -1) {
      setCurrentIndex(Math.floor(activeIndex / categoriesToShow) * categoriesToShow);
    }
  }, [activeCategory, categories, categoriesToShow]);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const maxIndex = Math.max(0, categories.length - categoriesToShow);
    setCurrentIndex(prev => Math.min(prev + categoriesToShow, maxIndex));
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => Math.max(prev - categoriesToShow, 0));
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const canGoNext = currentIndex + categoriesToShow < categories.length;
  const canGoPrev = currentIndex > 0;

  const visibleCategories = categories.slice(currentIndex, currentIndex + categoriesToShow);

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
    <div className="category-carousel">
      <div className="carousel-container">
        {/* Previous Button */}
        <button 
          className={`carousel-button carousel-button-prev ${!canGoPrev ? 'disabled' : ''}`}
          onClick={canGoPrev ? prevSlide : undefined}
          aria-label="Previous categories"
          disabled={!canGoPrev}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Categories */}
        <div 
          className={`carousel-track ${isDragging ? 'dragging' : ''}`}
          ref={trackRef}
        >
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className={`carousel-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => !isDragging && onCategoryClick(category.id)}
            >
              <div className="category-card">
                <div className="category-image-container">
                  <img 
                    src={category.coverImage} 
                    alt={category.title}
                    className="category-image"
                  />
                  <div className="category-overlay">
                  </div>
                </div>
                <div className="category-content">
                  <h3 className="category-title">{category.title}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-count">
                    {category.templateCount} templates
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button 
          className={`carousel-button carousel-button-next ${!canGoNext ? 'disabled' : ''}`}
          onClick={canGoNext ? nextSlide : undefined}
          aria-label="Next categories"
          disabled={!canGoNext}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {Array.from({ length: Math.ceil(categories.length / categoriesToShow) }).map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${Math.floor(currentIndex / categoriesToShow) === index ? 'active' : ''}`}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(index * categoriesToShow);
              setTimeout(() => setIsTransitioning(false), 300);
            }}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel; 