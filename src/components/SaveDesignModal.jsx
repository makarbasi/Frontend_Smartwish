import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/LanguageContext';
import { generateCardImages, saveImagesToCloud } from '../utils/generateImage';
import '../styles/SaveDesignModal.css';
import { getApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

const SaveDesignModal = ({ designData, onSave, onClose, isEditing = false, existingDesign = null }) => {
  const { user, authenticatedFetch } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState(existingDesign?.title || '');
  const [description, setDescription] = useState(existingDesign?.description || '');
  const [category, setCategory] = useState(existingDesign?.category || 'birthday');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'birthday', displayName: 'Birthday' },
    { id: 'anniversary', displayName: 'Anniversary' },
    { id: 'wedding', displayName: 'Wedding' },
    { id: 'graduation', displayName: 'Graduation' },
    { id: 'christmas', displayName: 'Christmas' },
    { id: 'valentine', displayName: 'Valentine\'s Day' },
    { id: 'mothers-day', displayName: 'Mother\'s Day' },
    { id: 'fathers-day', displayName: 'Father\'s Day' },
    { id: 'thank-you', displayName: 'Thank You' },
    { id: 'get-well', displayName: 'Get Well' },
    { id: 'sympathy', displayName: 'Sympathy' },
    { id: 'congratulations', displayName: 'Congratulations' },
    { id: 'holiday', displayName: 'Holiday' },
    { id: 'other', displayName: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title for your card');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Step 1: Check if we need to generate new images
      let cardImages = [];
      let imageSaveResult = null;
      
      // If editing and we have existing cloud images, check if we need to regenerate
      if (isEditing && existingDesign?.imageUrls && existingDesign.imageUrls.length > 0) {
        console.log('Editing existing design with cloud images, checking if regeneration is needed...');
        
        // For now, always regenerate images to ensure they reflect current changes
        // In the future, we could implement a more sophisticated change detection
        console.log('Generating new card images for updated design...');
        cardImages = await generateCardImages(designData);
        
        if (cardImages.length === 0) {
          throw new Error('No card images could be generated');
        }

        // Step 2: Save new images to cloud storage (old images will be replaced)
        console.log('Saving new images to cloud storage...');
        imageSaveResult = await saveImagesToCloud(cardImages, user.id, existingDesign.id, existingDesign.imageUrls);
        
        // Note: Old images are not automatically deleted to avoid breaking existing links
        // They will be cleaned up by a separate maintenance process
      } else {
        // New design or no existing cloud images - generate and save
        console.log('Generating card images for new design...');
        cardImages = await generateCardImages(designData);
        
        if (cardImages.length === 0) {
          throw new Error('No card images could be generated');
        }

        // Step 2: Save images to cloud storage
        console.log('Saving images to cloud storage...');
        imageSaveResult = await saveImagesToCloud(cardImages, user.id);
      }
      
      // Step 3: Prepare design data with cloud image references
      const saveData = {
        title: title.trim(),
        description: description.trim(),
        category,
        designData: {
          templateKey: designData.templateKey,
          pages: designData.pages,
          editedPages: designData.editedPages || {}
        },
        // Add cloud image references - always use the newly generated/saved images
        imageUrls: imageSaveResult.cloudUrls,
        imageTimestamp: imageSaveResult.timestamp,
        // Add metadata fields for consistency
        author: user.name,
        upload_time: new Date().toISOString(),
        price: 0,
        language: 'en',
        region: 'US',
        popularity: 0,
        num_downloads: 0,
        searchKeywords: [],
        status: 'draft'
      };

      // Use centralized API configuration
      const apiUrl = getApiUrl(API_ENDPOINTS.SAVE_DESIGN);
      const url = isEditing 
        ? `${apiUrl}/${existingDesign.id}`
        : apiUrl;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Use authenticatedFetch to ensure Authorization header is included
      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...saveData,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save design');
      }

      const savedDesign = await response.json();
      console.log('Design saved successfully with images:', savedDesign);
      
      // Close the modal first, then call onSave
      onClose();
      onSave(savedDesign);
    } catch (err) {
      console.error('Error saving design:', err);
      if (err.message === 'Authentication required') {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to save card. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="save-design-modal">
      <div className="save-design-content">
        <div className="save-design-header">
          <h2>{isEditing ? 'Update Your Card' : 'Save Your Card'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="save-design-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your card"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your card (optional)"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={saving || !title.trim() || !category}
            >
              {saving ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Card' : 'Save Card')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveDesignModal; 