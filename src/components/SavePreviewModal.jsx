import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/LanguageContext';
import '../styles/ModalBase.css';
import '../styles/SavePreviewModal.css';
import { getApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

const SavePreviewModal = ({ onSaveAsNew, onReplaceCard, onClose }) => {
  const { user, authenticatedFetch } = useAuth();
  const { t } = useLanguage();
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Use centralized API configuration
  const apiUrl = getApiUrl(API_ENDPOINTS.SAVE_DESIGN);

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const fetchSavedCards = async () => {
    try {
      console.log('SavePreviewModal: Fetching saved cards...');
      if (!user || !localStorage.getItem('token')) {
        setError('You must be logged in to view your saved cards.');
        setLoading(false);
        return;
      }
      const response = await authenticatedFetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('GET /saved-designs response status:', response.status);
      let data = null;
      try {
        data = await response.json();
        console.log('GET /saved-designs response body:', data);
      } catch (e) {
        console.log('GET /saved-designs response not JSON');
      }
      if (response.ok) {
        setSavedCards(data);
        setError(null);
      } else {
        setError(`Failed to load saved cards (${response.status})`);
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching saved cards:', error);
      if (error.message === 'Authentication required') {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setShowConfirmation(true);
  };

  const handleSaveAsNew = () => {
    onSaveAsNew();
    onClose();
  };

  const handleReplaceCard = () => {
    onReplaceCard(selectedCard);
    onClose();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setSelectedCard(null);
  };

  if (showConfirmation && selectedCard) {
    return (
      <div className="save-preview-modal-overlay">
        <div className="save-preview-modal confirmation-modal">
          <div className="save-preview-header">
            <h2>Replace Card?</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="confirmation-content">
            <p>Are you sure you want to replace <strong>"{selectedCard.title}"</strong>?</p>
            <p>This action cannot be undone.</p>
            <div className="confirmation-buttons">
              <button 
                className="cancel-button"
                onClick={handleCancelConfirmation}
              >
                Cancel
              </button>
              <button 
                className="replace-button"
                onClick={handleReplaceCard}
              >
                Replace Card
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="save-preview-modal-overlay">
      <div className="save-preview-modal">
        <div className="save-preview-header">
          <h2>Save Your Card</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="save-preview-content">
          {loading ? (
            <div className="loading">Loading saved cards...</div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="retry-button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchSavedCards();
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {/* New Card Option */}
              <div 
                className="card-preview new-card"
                onClick={handleSaveAsNew}
              >
                <div className="card-preview-image new-card-image">
                  <div className="new-card-content">
                    <div className="new-card-icon">+</div>
                    <div className="new-card-text">New Card</div>
                  </div>
                </div>
                <div className="card-preview-info">
                  <h3>Create New Card</h3>
                  <p>Save as a new card with a unique name</p>
                </div>
              </div>

              {/* Existing Saved Cards */}
              {savedCards.map((card) => (
                <div 
                  key={card.id}
                  className="card-preview existing-card"
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="card-preview-image">
                    <img 
                      src={card.designData.pages[0]?.image || '/images/blank.jpg'} 
                      alt={card.title}
                    />
                    <div className="card-overlay">
                      <div className="card-title">{card.title}</div>
                      <div className="card-description">{card.description}</div>
                    </div>
                  </div>
                  <div className="card-preview-info">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <div className="card-meta">
                      <span className="card-category">{card.category}</span>
                      <span className="card-date">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </span>
                    </div>
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

export default SavePreviewModal; 