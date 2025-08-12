import React, { useState, useRef, useEffect } from 'react';

// AI Filter data from ImageEditor
const aiFilters = [
  {
    id: 'disney',
    theme: 'Disney',
    title: 'Disney Character',
    color: '#FF6B9D',
    image: '/images/themes/disney.jpg',
    prompt: 'change this image to a whimsical Disney-style with vibrant colors, expressive features, and magical atmosphere'
  },
  {
    id: 'pencil-sketch',
    theme: 'Pencil Sketch',
    title: 'Pencil Sketch',
    color: '#8B8B8B',
    image: '/images/themes/pencil-sketch.jpg',
    prompt: 'change this image to a minimalist pencil sketch with fine lines, subtle shading, and elegant black-and-white composition'
  },
  {
    id: 'anime',
    theme: 'Anime',
    title: 'Anime Style',
    color: '#FF9F43',
    image: '/images/themes/anime.jpg',
    prompt: 'change this image to a Japanese anime-style illustration with bold colors, expressive eyes, and dynamic character design'
  },
  {
    id: 'pixar',
    theme: 'Pixar-style 3D',
    title: 'Pixar-style 3D',
    color: '#00D2D3',
    image: '/images/themes/pixar.jpg',
    prompt: 'change this image to a Pixar-style 3D character with realistic textures, expressive features, and warm lighting'
  },
  {
    id: 'watercolor',
    theme: 'Watercolor',
    title: 'Watercolor',
    color: '#54A0FF',
    image: '/images/themes/watercolor.jpg',
    prompt: 'change this image to a soft watercolor painting with flowing colors, gentle brush strokes, and dreamy atmosphere'
  },
  {
    id: 'oil-painting',
    theme: 'Oil Painting',
    title: 'Oil Painting',
    color: '#FF6348',
    image: '/images/themes/oil-painting.jpg',
    prompt: 'change this image to a textured oil painting with thick brush strokes, rich colors, and artistic depth'
  },
  {
    id: 'charcoal',
    theme: 'Charcoal',
    title: 'Charcoal Drawing',
    color: '#2C3E50',
    image: '/images/themes/charcoal.jpg',
    prompt: 'change this image to a moody charcoal drawing with dramatic shadows, bold contrasts, and artistic intensity'
  },
  {
    id: 'line-art',
    theme: 'Line Art',
    title: 'Line Art',
    color: '#000000',
    image: '/images/themes/line-art.jpg',
    prompt: 'change this image to a Clean line art with bold inked lines, minimal shading, and graphic design style'
  },
  {
    id: 'pop-art',
    theme: 'Pop Art',
    title: 'Pop Art',
    color: '#FF6B6B',
    image: '/images/themes/pop-art.jpg',
    prompt: 'change this image to a Bright pop art with high contrast colors, bold patterns, and Andy Warhol-inspired style'
  },
  {
    id: 'stencil',
    theme: 'Stencil',
    title: 'Stencil Art',
    color: '#5F27CD',
    image: '/images/themes/stencil.jpg',
    prompt: 'change this image to a Street art stencil design with sharp edges, minimalist colors, and urban graffiti style'
  },
  {
    id: 'low-poly',
    theme: 'Low Poly',
    title: 'Low Poly',
    color: '#00B894',
    image: '/images/themes/low-poly.jpg',
    prompt: 'change this image to a Low poly 3D design with geometric shapes, flat shading, and modern minimalist style'
  }
];

// Custom AI Filter Tool Component
const AIFilterTool = ({ onApplyFilter, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const carouselRef = useRef(null);
  const [carouselPosition, setCarouselPosition] = useState(0);

  const handleFilterClick = async (filter) => {
    setSelectedFilter(filter);
    setIsProcessing(true);
    
    try {
      // Apply the AI filter using the prompt
      await onApplyFilter(filter.prompt);
    } catch (error) {
      console.error('Error applying AI filter:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const scrollCarousel = (direction) => {
    const totalFilters = aiFilters.length;
    if (direction === 'left') {
      setCarouselPosition(prev => prev > 0 ? prev - 1 : totalFilters - 1);
    } else {
      setCarouselPosition(prev => prev < totalFilters - 1 ? prev + 1 : 0);
    }
  };

  const getVisibleFilters = () => {
    const visibleCount = 5; // Show 5 filters at a time
    const visibleFilters = [];
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (carouselPosition + i) % aiFilters.length;
      visibleFilters.push(aiFilters[index]);
    }
    
    return visibleFilters;
  };

  return (
    <div className="pintura-ai-filter-tool">
      <div className="ai-filter-header">
        <h3>AI Filters</h3>
        <button onClick={onClose} className="ai-filter-close">✕</button>
      </div>
      
      <div className="ai-filter-carousel">
        <button 
          className="carousel-arrow left" 
          onClick={() => scrollCarousel('left')}
        >
          ‹
        </button>
        
        <div className="filter-cards" ref={carouselRef}>
          {getVisibleFilters().map((filter) => (
            <div
              key={filter.id}
              className={`filter-card ${selectedFilter?.id === filter.id ? 'selected' : ''}`}
              onClick={() => handleFilterClick(filter)}
              style={{ borderColor: filter.color }}
            >
              <div className="filter-image">
                <img 
                  src={filter.image} 
                  alt={filter.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="filter-placeholder" style={{ backgroundColor: filter.color }}>
                  {filter.theme.charAt(0)}
                </div>
              </div>
              <div className="filter-title">{filter.title}</div>
              {isProcessing && selectedFilter?.id === filter.id && (
                <div className="processing-indicator">Processing...</div>
              )}
            </div>
          ))}
        </div>
        
        <button 
          className="carousel-arrow right" 
          onClick={() => scrollCarousel('right')}
        >
          ›
        </button>
      </div>
    </div>
  );
};

// Create the custom Pintura plugin
export const createAIFilterPlugin = (onApplyFilter) => {
  return {
    name: 'ai-filters',
    utils: ['ai-filters'],
    
    // Plugin options
    options: {
      aiFilters: {
        enabled: true,
        onApplyFilter: onApplyFilter
      }
    },
    
    // Create the custom tool
    createTool: (options) => ({
      name: 'ai-filters',
      icon: '✨',
      label: 'AI Filters',
      component: AIFilterTool,
      props: {
        onApplyFilter: options.aiFilters?.onApplyFilter || onApplyFilter,
        onClose: () => {
          // Close the tool panel
          if (options.onClose) options.onClose();
        }
      }
    })
  };
};

export default AIFilterTool;

