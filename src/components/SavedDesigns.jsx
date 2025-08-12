import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faPlus, faEllipsisH, faTrash, faUpload, faInbox, faGlobe } from '@fortawesome/free-solid-svg-icons';
import PublishModal from './PublishModal';
import '../styles/SavedDesigns.css';
import { getApiUrl, API_ENDPOINTS, logApiConfig } from '../utils/apiConfig';

const SavedDesigns = ({ onLoadDesign, onClose, onAddMedia, onShareCard, onPublishDesign }) => {
  const { user, authenticatedFetch } = useAuth();
  const { t } = useLanguage();
  const [designs, setDesigns] = useState([]);
  const [publishedDesigns, setPublishedDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openOverlayId, setOpenOverlayId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [designToDelete, setDesignToDelete] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [designToPublish, setDesignToPublish] = useState(null);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'inbox', 'published'

  useEffect(() => {
    if (user) {
      loadUserDesigns();
      loadPublishedDesigns();
    }
  }, [user]);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openOverlayId && !event.target.closest('.more-actions-container')) {
        setOpenOverlayId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openOverlayId]);

  const loadUserDesigns = async () => {
    try {
      setLoading(true);
      if (!user || !localStorage.getItem('token')) {
        setError('You must be logged in to view your saved cards.');
        setLoading(false);
        return;
      }
      // Use centralized API configuration
      const apiUrl = getApiUrl(API_ENDPOINTS.SAVE_DESIGN);
      const response = await authenticatedFetch(`${apiUrl}?userId=${user.id}`, {
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
      if (!response.ok) {
        throw new Error('Failed to load designs');
      }
      setDesigns(data);
    } catch (err) {
      console.error('Error loading designs:', err);
      if (err.message === 'Authentication required') {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPublishedDesigns = async () => {
    try {
      if (!user || !localStorage.getItem('token')) {
        console.log('No user or token, skipping published designs load');
        return;
      }
      
      console.log('Loading published designs for user:', user.id);
      // Use centralized API configuration
      const apiUrl = getApiUrl(API_ENDPOINTS.PUBLISHED_DESIGNS);
      console.log('API URL:', apiUrl);
      
      const response = await authenticatedFetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Published designs response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('All published designs:', data);
        console.log('User ID:', user.id, 'Type:', typeof user.id);
        
        // Filter to only show designs published by the current user
        // Check both userId and user_id fields for compatibility
        const userPublishedDesigns = data.filter(design => {
          console.log('Checking design:', design.id, 'userId:', design.userId, 'user_id:', design.user_id);
          return (
            design.userId === user.id || 
            design.user_id === user.id ||
            design.userId === user.id.toString() ||
            design.user_id === user.id.toString()
          );
        });
        
        console.log('User published designs:', userPublishedDesigns);
        setPublishedDesigns(userPublishedDesigns);
      } else {
        console.error('Failed to load published designs, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (err) {
      console.error('Error loading published designs:', err);
    }
  };

  // Add a function to refresh published designs after publishing
  const refreshPublishedDesigns = () => {
    loadPublishedDesigns();
  };

  const handleLoadDesign = (design) => {
    onLoadDesign(design);
    onClose();
  };

  const handleAddMedia = (design) => {
    onAddMedia(design);
    onClose();
  };

  const handleShareCard = (design) => {
    onShareCard(design);
    onClose();
  };

  const handlePublishDesign = (design) => {
    setDesignToPublish(design);
    setShowPublishModal(true);
    setOpenOverlayId(null); // Close overlay
  };

  const toggleOverlay = (designId) => {
    setOpenOverlayId(openOverlayId === designId ? null : designId);
  };

  const handleOverlayAction = (action, design) => {
    setOpenOverlayId(null); // Close overlay
    action(design);
  };

  const handleDeleteDesign = async (designId) => {
    setDesignToDelete(designs.find(d => d.id === designId));
    setShowDeleteModal(true);
    setOpenOverlayId(null); // Close overlay
  };

  const confirmDelete = async () => {
    try {
      // Use centralized API configuration
      const apiUrl = getApiUrl(API_ENDPOINTS.SAVE_DESIGN);
      const response = await authenticatedFetch(`${apiUrl}/${designToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setDesigns(designs.filter(d => d.id !== designToDelete.id));
        setShowDeleteModal(false);
        setDesignToDelete(null);
      } else {
        throw new Error('Failed to delete design');
      }
    } catch (err) {
      console.error('Error deleting design:', err);
      setError('Failed to delete design. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDesignToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderDesignCard = (design, isPublished = false) => (
    <div key={design.id} className="design-card">
      <div className="design-thumbnail">
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
        ) : design.designData.pages && design.designData.pages.length > 0 ? (
          <div 
            className="card-preview"
            style={{
              backgroundImage: `url(${design.designData.editedPages?.[0] || design.designData.pages[0].image})`,
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
        ) : (
          <div className="placeholder-thumbnail">
            <span>📄</span>
          </div>
        )}
      </div>
      <div className="design-info">
        <h3>{design.title}</h3>
        <p className="design-description">{design.description}</p>
        <p className="design-category">{design.category}</p>
        <p className="design-date">Created: {formatDate(design.createdAt)}</p>
        {isPublished && (
          <div className="published-badge">
            <FontAwesomeIcon icon={faGlobe} />
            <span>Published</span>
          </div>
        )}
      </div>
      <div className="design-actions">
        <button 
          className="load-button"
          onClick={() => handleLoadDesign(design)}
          title="Load Card"
        >
          Load Card
        </button>
        {!isPublished && (
          <div className="more-actions-container">
            <button 
              className="more-actions-button"
              onClick={() => toggleOverlay(design.id)}
              title="More Actions"
            >
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
            
            {openOverlayId === design.id && (
              <div className="actions-overlay">
                <button 
                  className="overlay-action add-media-action"
                  onClick={() => handleOverlayAction(handleAddMedia, design)}
                  title="Add Media"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Add Media</span>
                </button>
                <button 
                  className="overlay-action share-action"
                  onClick={() => handleOverlayAction(handleShareCard, design)}
                  title="Send E-Card"
                >
                  <FontAwesomeIcon icon={faShare} />
                  <span>Send E-Card</span>
                </button>
                <button 
                  className="overlay-action publish-action"
                  onClick={() => handleOverlayAction(handlePublishDesign, design)}
                  title={t('publishDesign')}
                >
                  <FontAwesomeIcon icon={faUpload} />
                  <span>{t('publishDesign')}</span>
                </button>
                <button 
                  className="overlay-action delete-action"
                  onClick={() => handleOverlayAction(() => handleDeleteDesign(design.id), design)}
                  title="Delete Card"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="saved-designs-modal">
        <div className="saved-designs-content">
          <div className="error">Error: {error}</div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-designs-modal">
      <div className="saved-designs-content">
        <div className="saved-designs-header">
          <h2>My Cards</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="saved-designs-tabs">
          <button 
            className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Save Cards</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <FontAwesomeIcon icon={faInbox} />
            <span>Inbox</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'published' ? 'active' : ''}`}
            onClick={() => setActiveTab('published')}
          >
            <FontAwesomeIcon icon={faGlobe} />
            <span>Published Cards</span>
          </button>
        </div>

        <div className="saved-designs-body">
          {activeTab === 'saved' && (
            <div className="tab-content">
              {loading ? (
                <div className="loading">Loading your saved cards...</div>
              ) : designs.length === 0 ? (
                <div className="no-designs">
                  <p>You haven't saved any cards yet.</p>
                  <p>Create and save your first card to see it here!</p>
                </div>
              ) : (
                <div className="designs-grid">
                  {designs.map((design) => renderDesignCard(design))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="tab-content">
              <div className="inbox-placeholder">
                <div className="inbox-icon">
                  <FontAwesomeIcon icon={faInbox} size="3x" />
                </div>
                <h3>Inbox Coming Soon</h3>
                <p>This feature is under development. You'll be able to receive and manage cards shared with you here.</p>
                <div className="inbox-features">
                  <div className="feature-item">
                    <span className="feature-icon">📨</span>
                    <span>Receive shared cards</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📱</span>
                    <span>View notifications</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💬</span>
                    <span>Message history</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'published' && (
            <div className="tab-content">
              {loading ? (
                <div className="loading">Loading your published cards...</div>
              ) : publishedDesigns.length === 0 ? (
                <div className="no-designs">
                  <p>You haven't published any cards yet.</p>
                  <p>Publish your designs to share them with the community!</p>
                </div>
              ) : (
                <div className="designs-grid">
                  {publishedDesigns.map((design) => renderDesignCard(design, true))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && designToDelete && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <div className="delete-confirmation-header">
              <h3>Delete Card</h3>
              <button className="close-button" onClick={cancelDelete}>×</button>
            </div>
            
            <div className="delete-confirmation-body">
              <div className="delete-warning-icon">⚠️</div>
              <p>Are you sure you want to delete <strong>"{designToDelete.title}"</strong>?</p>
              <p className="delete-warning-text">This action cannot be undone.</p>
            </div>
            
            <div className="delete-confirmation-actions">
              <button 
                className="cancel-delete-button"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={onPublishDesign}
        design={designToPublish}
        onRefresh={refreshPublishedDesigns}
      />
    </div>
  );
};

export default SavedDesigns; 