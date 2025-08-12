import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/LanguageContext.jsx';
import TemplateRibbon from './TemplateRibbon.jsx';
import '../styles/SearchBar.css';

// Utility function to get base URL based on environment
const getBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port || 5173}`;
  } else {
    // Check if we're on Render.com
    if (window.location.hostname.includes('onrender.com')) {
      return `${window.location.protocol}//${window.location.hostname}`;
    } else {
      return import.meta.env.VITE_PRODUCTION_URL || 'https://app.smartwish.us';
    }
  }
};

const SearchBar = ({ 
  onSearchResults, 
  onClearSearch, 
  onSearch, // For marketplace search
  value, // For marketplace controlled input
  placeholder, // Custom placeholder
  isMarketplace = false // Flag to indicate marketplace mode
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const searchInputRef = useRef(null);

  // Update searchQuery when value prop changes (for marketplace controlled input)
  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      recognitionRef.current = null;
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      console.log('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    recognitionRef.current.start();
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      if (isMarketplace && onSearch) {
        onSearch(transcript);
      }
      setIsListening(false);
    };
    recognitionRef.current.onerror = (error) => {
      setIsListening(false);
    };
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      if (isMarketplace) {
        onSearch('');
      } else {
        onClearSearch();
      }
      return;
    }

    if (isMarketplace) {
      // For marketplace, just pass the query to parent component
      onSearch(searchQuery);
      return;
    }

    // Original template search logic
    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(`${getBaseUrl()}/search-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      onSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    if (isMarketplace) {
      onSearch('');
    } else {
      onClearSearch();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (isMarketplace && onSearch) {
      onSearch(newValue);
    }
  };

  // Get appropriate placeholder text
  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    if (isMarketplace) return "Search cash gifts, gift cards, and memberships...";
    return t('searchPlaceholder') || "What type of card are you looking for? (e.g., birthday, wedding, thank you)";
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={getPlaceholderText()}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className={`search-input ${isMarketplace ? 'marketplace-search' : ''}`}
          />
          
          {/* Microphone button positioned inside the input field */}
          <button
            type="button"
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={handleMicClick}
            title={isListening ? t('listening') || 'Listening...' : t('voiceInput') || 'Voice Input'}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: isListening ? 'rgba(46, 134, 171, 0.2)' : 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #ddd',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              boxSizing: 'border-box'
            }}
          >
            <img 
              src="/mic.svg" 
              alt={t('voiceInput') || 'Voice Input'} 
              width="16" 
              height="16"
              style={{ 
                filter: isListening 
                  ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(86deg) brightness(118%) contrast(119%)' 
                  : 'brightness(0) saturate(100%) invert(0)'
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span 
              style={{ 
                display: 'none', 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: isListening ? '#2E86AB' : '#000'
              }}
            >
              🎤
            </span>
          </button>
        </div>

        {!isMarketplace && (
          <button 
            className="search-button"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? t('searching') || 'Searching...' : t('search') || 'Search'}
          </button>
        )}

        {searchQuery && (
          <button 
            className="clear-button"
            onClick={handleClearSearch}
            title={t('clear') || 'Clear'}
          >
            ✕
          </button>
        )}
      </div>

      {!isMarketplace && showResults && (
        <div className="search-results">
          {isSearching ? (
            <div className="search-loading">
              <div className="spinner"></div>
              <p>{t('searchingTemplates') || 'Searching templates...'}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="results-container">
              <h3>{t('searchResults') || 'Search Results'} ({searchResults.length})</h3>
              <div className="results-grid">
                {searchResults.map((template) => (
                  <div 
                    key={template.key} 
                    className="search-result-item"
                    onClick={() => {
                      // This will be handled by the parent component
                      onSearchResults([template]);
                    }}
                  >
                    <div className="result-image-container">
                      <img 
                        src={`images/${template.key}.jpg`} 
                        alt={template.title}
                        className="result-image"
                        onError={(e) => {
                          e.target.src = 'images/blank.jpg';
                        }}
                      />
                      {template.author && (
                        <TemplateRibbon template={template} />
                      )}
                    </div>
                    <div className="result-info">
                      <h4>{template.title}</h4>
                      <p>{template.text}</p>
                      <span className="result-category">{t(template.category) || template.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery && !isSearching ? (
            <div className="no-results">
              <p>{t('noResultsFound') || 'No templates found matching your search.'}</p>
              <p>{t('tryDifferentKeywords') || 'Try different keywords or browse categories below.'}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 