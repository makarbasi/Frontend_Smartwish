import React from 'react';
import '../styles/TemplateRibbon.css';

const TemplateRibbon = ({ template }) => {
  const { author, price, popularity } = template;

  // Format price
  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  // Format popularity as stars or percentage
  const formatPopularity = (popularity) => {
    if (popularity >= 90) return '⭐⭐⭐⭐⭐';
    if (popularity >= 80) return '⭐⭐⭐⭐';
    if (popularity >= 70) return '⭐⭐⭐';
    if (popularity >= 60) return '⭐⭐';
    return '⭐';
  };

  // Determine if author is SmartWish
  const isSmartWish = author === 'SmartWish';
  const ribbonClass = isSmartWish ? 'template-ribbon smartwish' : 'template-ribbon community';

  return (
    <div className={ribbonClass}>
      <div className="ribbon-content">
        <div className="ribbon-item author">
          <span className="ribbon-label">By:</span>
          <span className="ribbon-value">{author || 'Unknown'}</span>
        </div>
        <div className="ribbon-item price">
          <span className="ribbon-label">Price:</span>
          <span className="ribbon-value">{formatPrice(price || 0)}</span>
        </div>
        <div className="ribbon-item popularity">
          <span className="ribbon-label">Rating:</span>
          <span className="ribbon-value">{formatPopularity(popularity || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateRibbon; 