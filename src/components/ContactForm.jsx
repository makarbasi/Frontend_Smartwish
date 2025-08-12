import React, { useState, useEffect } from 'react';
import '../styles/ContactForm.css';

const ContactForm = ({ contact, onSubmit, onClose, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    relationship: '',
    occupation: '',
    company: '',
    interests: '',
    hobbies: '',
    notes: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      tiktok: '',
      snapchat: '',
      twitter: '',
      linkedin: '',
      whatsapp: '',
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact && mode === 'edit') {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phoneNumber: contact.phoneNumber || '',
        address: contact.address || '',
        relationship: contact.relationship || '',
        occupation: contact.occupation || '',
        company: contact.company || '',
        interests: contact.interests ? contact.interests.join(', ') : '',
        hobbies: contact.hobbies ? contact.hobbies.join(', ') : '',
        notes: contact.notes || '',
        socialMedia: {
          facebook: contact.socialMedia?.facebook || '',
          instagram: contact.socialMedia?.instagram || '',
          tiktok: contact.socialMedia?.tiktok || '',
          snapchat: contact.socialMedia?.snapchat || '',
          twitter: contact.socialMedia?.twitter || '',
          linkedin: contact.socialMedia?.linkedin || '',
          whatsapp: contact.socialMedia?.whatsapp || '',
        }
      });
    }
  }, [contact, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert comma-separated strings to arrays
    const processedData = {
      ...formData,
      interests: formData.interests ? formData.interests.split(',').map(item => item.trim()).filter(item => item) : [],
      hobbies: formData.hobbies ? formData.hobbies.split(',').map(item => item.trim()).filter(item => item) : [],
    };

    onSubmit(processedData);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="contact-form-overlay">
      <div className="contact-form-modal">
        <div className="contact-form-header">
          <h2>{mode === 'create' ? 'Add New Contact' : 'Edit Contact'}</h2>
          <button className="close-btn" onClick={handleCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="relationship">Relationship</label>
                <select
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                >
                  <option value="">Select relationship</option>
                  <option value="Friend">Friend</option>
                  <option value="Family">Family</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Acquaintance">Acquaintance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="occupation">Occupation</label>
                <input
                  type="text"
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Social Media</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="facebook">Facebook</label>
                <input
                  type="url"
                  id="facebook"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <input
                  type="url"
                  id="instagram"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="twitter">Twitter</label>
                <input
                  type="url"
                  id="twitter"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  type="url"
                  id="linkedin"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tiktok">TikTok</label>
                <input
                  type="url"
                  id="tiktok"
                  value={formData.socialMedia.tiktok}
                  onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  type="text"
                  id="whatsapp"
                  value={formData.socialMedia.whatsapp}
                  onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="interests">Interests (comma-separated)</label>
              <input
                type="text"
                id="interests"
                value={formData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                placeholder="Reading, Travel, Music"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hobbies">Hobbies (comma-separated)</label>
              <input
                type="text"
                id="hobbies"
                value={formData.hobbies}
                onChange={(e) => handleInputChange('hobbies', e.target.value)}
                placeholder="Photography, Cooking, Gaming"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows="4"
                placeholder="Add any additional notes about this contact..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {mode === 'create' ? 'Add Contact' : 'Update Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm; 