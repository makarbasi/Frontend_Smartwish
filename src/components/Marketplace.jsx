import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import '../styles/Marketplace.css';

const Marketplace = ({ onClose, onSelectItem }) => {
  const [activeTab, setActiveTab] = useState('cash-gift');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/marketplace`);
      if (response.ok) {
        const data = await response.json();
        console.log('Marketplace items loaded:', data.length, 'items');
        console.log('First item image path:', data[0]?.image);
        setItems(data);
      } else {
        console.error('Failed to fetch marketplace items');
      }
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered;
    
    // Always filter from API data for all tabs
    filtered = items.filter(item => item.category === activeTab);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      console.log(`Searching for: "${query}" in ${activeTab} category`);
      console.log(`Total items in category: ${filtered.length}`);
      
      filtered = filtered.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(query));
        const featuresMatch = item.features && item.features.some(feature => feature.toLowerCase().includes(query));
        
        const matches = nameMatch || descMatch || tagsMatch || featuresMatch;
        
        if (matches) {
          console.log(`Match found: ${item.name} (${nameMatch ? 'name' : ''}${descMatch ? ' desc' : ''}${tagsMatch ? ' tags' : ''}${featuresMatch ? ' features' : ''})`);
        }
        
        return matches;
      });
      
      console.log(`Items matching search: ${filtered.length}`);
    }
    
    setFilteredItems(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleItemSelect = (item) => {
    if (activeTab === 'cash-gift') {
      // Handle cash gift option selection
      console.log(`Selected cash gift method: ${item.name}`);
      alert(`${item.name} - Payment functionality would be implemented here`);
      // You can add specific payment handling logic here
    } else {
      // Handle regular marketplace item selection
      onSelectItem(item);
      onClose();
    }
  };

  const formatPrice = (price, currency) => {
    if (price === 0) {
      return 'Free';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const [imageStates, setImageStates] = useState({});

  const handleImageError = (e, itemName) => {
    console.error(`Failed to load image for ${itemName}:`, e.target.src);
    setImageStates(prev => ({
      ...prev,
      [itemName]: 'error'
    }));
    e.target.style.display = 'none';
  };

  const handleImageLoad = (itemName) => {
    console.log(`Successfully loaded image for ${itemName}`);
    setImageStates(prev => ({
      ...prev,
      [itemName]: 'loaded'
    }));
  };

  const handleImageStart = (itemName) => {
    setImageStates(prev => ({
      ...prev,
      [itemName]: 'loading'
    }));
  };

  if (loading) {
    return (
      <div className="marketplace-modal-overlay">
        <div className="marketplace-modal">
          <div className="loading">Loading marketplace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-modal-overlay">
      <div className="marketplace-modal">
        <div className="marketplace-header">
          <h1>Gift Marketplace</h1>
          <button 
            className="close-modal-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="marketplace-search">
          <SearchBar
            placeholder="Search cash gifts, gift cards, and memberships..."
            onSearch={handleSearch}
            value={searchQuery}
            isMarketplace={true}
          />
        </div>

        <div className="marketplace-tabs">
          <button 
            className={`tab-btn ${activeTab === 'cash-gift' ? 'active' : ''}`}
            onClick={() => handleTabChange('cash-gift')}
          >
            Cash Gift
          </button>
          <button 
            className={`tab-btn ${activeTab === 'gift-card' ? 'active' : ''}`}
            onClick={() => handleTabChange('gift-card')}
          >
            Gift Cards
          </button>
          <button 
            className={`tab-btn ${activeTab === 'membership' ? 'active' : ''}`}
            onClick={() => handleTabChange('membership')}
          >
            Memberships
          </button>
        </div>

        <div className="marketplace-content">
          {filteredItems.length === 0 ? (
            <div className="marketplace-empty">
              <div className="empty-icon">🎁</div>
              <h3>No items found</h3>
              <p>
                {searchQuery 
                  ? `No ${activeTab === 'cash-gift' ? 'cash gift options' : activeTab === 'gift-card' ? 'gift cards' : 'memberships'} found matching "${searchQuery}". Try different keywords or browse all items.`
                  : `No ${activeTab === 'cash-gift' ? 'cash gift options' : activeTab === 'gift-card' ? 'gift cards' : 'memberships'} available at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="marketplace-grid">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="marketplace-item"
                  onClick={() => handleItemSelect(item)}
                >
                  <div className={`item-image ${imageStates[item.name] || 'loading'}`}>
                    <img 
                      src={`${API_BASE_URL}${item.image}`} 
                      alt={item.name}
                      onLoad={() => handleImageLoad(item.name)}
                      onError={(e) => handleImageError(e, item.name)}
                      onLoadStart={() => handleImageStart(item.name)}
                    />
                  </div>
                  <div className="item-info">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    <div className="item-price">
                      {formatPrice(item.price, item.currency)}
                      {item.category === 'membership' && (
                        <span className="item-duration"> / {item.duration}</span>
                      )}
                    </div>
                    {(item.category === 'membership' || item.category === 'cash-gift') && item.features && (
                      <div className="item-features">
                        {item.features.slice(0, 2).map((feature, index) => (
                          <span key={index} className="feature-tag">{feature}</span>
                        ))}
                        {item.features.length > 2 && (
                          <span className="feature-more">+{item.features.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace; 