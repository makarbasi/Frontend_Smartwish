import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/LanguageContext';
import { getAllCategories } from '../utils/templatesWrapper';
import { generateCardImages, saveImagesToCloud } from '../utils/generateImage';
import '../styles/PublishModal.css';
import { getApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

const PublishModal = ({ isOpen, onClose, onPublish, design, onRefresh }) => {
  const { user, authenticatedFetch } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    category: 'birthday',
    description: '',
    searchKeywords: '',
    language: 'en',
    region: 'US'
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load categories
      const categoriesList = getAllCategories();
      setCategories(categoriesList);
      
      // Pre-fill form with design data if available
      if (design) {
        setFormData({
          title: design.title || '',
          category: design.category || 'birthday',
          description: design.description || '',
          searchKeywords: '',
          language: 'en',
          region: 'US'
        });
      }
    }
  }, [isOpen, design]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.searchKeywords.trim()) {
      newErrors.searchKeywords = 'Search keywords are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsPublishing(true);
    setPublishProgress('Preparing design for publication...');

    try {
      // Step 1: Generate card images if not already available
      let cardImages = [];
      let imageSaveResult = null;
      
      if (design.imageUrls && design.imageUrls.length > 0) {
        console.log('Using existing cloud images for published design');
        imageSaveResult = {
          cloudUrls: design.imageUrls,
          timestamp: design.imageTimestamp || Date.now()
        };
      } else {
        setPublishProgress('Generating card images...');
        cardImages = await generateCardImages(design.designData);
        
        if (cardImages.length === 0) {
          throw new Error('No card images could be generated');
        }

        setPublishProgress('Saving images to cloud storage...');
        imageSaveResult = await saveImagesToCloud(cardImages, user.id, design.id, design.imageUrls);
      }

      // Step 2: Parse search keywords into array
      const keywords = formData.searchKeywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      // Step 3: Prepare publish data
      const publishData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        searchKeywords: keywords,
        language: formData.language,
        region: formData.region,
        author: user.name,
        upload_time: new Date().toISOString(),
        popularity: 0,
        num_downloads: 0,
        price: 0, // Free templates for user-created content
        imageUrls: imageSaveResult.cloudUrls,
        imageTimestamp: imageSaveResult.timestamp,
        status: 'published' // Set status to published
      };

      setPublishProgress('Publishing design...');

      // Step 4: Update the existing design with publish metadata
      const apiUrl = getApiUrl(API_ENDPOINTS.SAVE_DESIGN);
      const response = await authenticatedFetch(`${apiUrl}/${design.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...publishData,
          userId: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish design');
      }

      const publishedDesign = await response.json();
      console.log('Design published successfully:', publishedDesign);

      setPublishProgress('Publication complete!');
      
      // Call the parent's onPublish callback
      onPublish(publishedDesign);
      onClose();
      onRefresh(); // Refresh the list after successful publishing
      
    } catch (error) {
      console.error('Error publishing design:', error);
      setErrors({ submit: error.message || 'Failed to publish design. Please try again.' });
    } finally {
      setIsPublishing(false);
      setPublishProgress('');
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      category: 'birthday',
      description: '',
      searchKeywords: '',
      language: 'en',
      region: 'US'
    });
    setErrors({});
    setIsPublishing(false);
    setPublishProgress('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="publish-modal-overlay">
      <div className="publish-modal">
        <div className="publish-modal-header">
          <h2>{t('publishYourDesign')}</h2>
          <button className="close-button" onClick={handleCancel} disabled={isPublishing}>×</button>
        </div>
        
        {isPublishing && (
          <div className="publish-progress">
            <div className="progress-spinner"></div>
            <p>{publishProgress}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="publish-form">
          <div className="form-group">
            <label htmlFor="author">{t('author')}</label>
            <input
              type="text"
              id="author"
              value={user?.name || ''}
              disabled
              className="form-input disabled"
            />
            <small>{t('yourNameWillBeDisplayed')}</small>
          </div>

          <div className="form-group">
            <label htmlFor="title">{t('title')} *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder={t('enterTemplateTitle')}
              disabled={isPublishing}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">{t('category')} *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input"
              disabled={isPublishing}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('description')} *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder={t('describeYourTemplate')}
              rows={3}
              disabled={isPublishing}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="searchKeywords">{t('searchKeywords')} *</label>
            <input
              type="text"
              id="searchKeywords"
              name="searchKeywords"
              value={formData.searchKeywords}
              onChange={handleInputChange}
              className={`form-input ${errors.searchKeywords ? 'error' : ''}`}
              placeholder="e.g., birthday, celebration, party, cake"
              disabled={isPublishing}
            />
            <small>Separate keywords with commas</small>
            {errors.searchKeywords && <span className="error-message">{errors.searchKeywords}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">{t('language')}</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="form-input"
                disabled={isPublishing}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="id">Indonesian</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="region">{t('region')}</label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="form-input"
                disabled={isPublishing}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="CN">China</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="AR">Argentina</option>
                <option value="RU">Russia</option>
                <option value="SA">Saudi Arabia</option>
                <option value="AE">UAE</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
                <option value="TH">Thailand</option>
                <option value="VN">Vietnam</option>
                <option value="PH">Philippines</option>
                <option value="ID">Indonesia</option>
              </select>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="publish-modal-actions">
            <button type="button" className="cancel-button" onClick={handleCancel} disabled={isPublishing}>
              {t('cancel')}
            </button>
            <button type="submit" className="publish-button" disabled={isPublishing}>
              {isPublishing ? 'Publishing...' : t('publishTemplate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishModal;
