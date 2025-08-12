import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTiktok, faSnapchat } from '@fortawesome/free-brands-svg-icons';
import { faCheckCircle, faCamera } from '@fortawesome/free-solid-svg-icons';

const DEFAULT_AVATAR = '/images/blank_logo.png';

const Profile = ({ onClose }) => {
  const { user, setUser, authenticatedFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarKey, setAvatarKey] = useState(Date.now()); // for cache busting
  const [isMobileKeyboard, setIsMobileKeyboard] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      tiktok: '',
      snapchat: '',
    },
    interests: '',
    hobbies: [],
  });

  // Available hobbies
  const availableHobbies = [
    'Outdoor Activities',
    'Cinema',
    'Reading',
    'Gaming',
    'Cooking',
    'Travel',
    'Sports',
    'Music',
    'Art',
    'Photography',
    'Fitness',
    'Dancing',
    'Writing',
    'Technology',
    'Gardening',
    'Other'
  ];

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
    // eslint-disable-next-line
  }, [user]);

  // Mobile keyboard detection
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const isLandscape = window.innerHeight < window.innerWidth;
      const isShortHeight = window.innerHeight < 600;
      
      if (isMobile && (isLandscape || isShortHeight)) {
        setIsMobileKeyboard(true);
      } else {
        setIsMobileKeyboard(false);
      }
    };

    // Initial check
    handleResize();

    // Listen for resize events (keyboard appearance/disappearance)
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await authenticatedFetch(`${apiUrl}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const profileData = await response.json();
      
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phoneNumber: profileData.phoneNumber || '',
        socialMedia: {
          facebook: profileData.socialMedia?.facebook || '',
          instagram: profileData.socialMedia?.instagram || '',
          tiktok: profileData.socialMedia?.tiktok || '',
          snapchat: profileData.socialMedia?.snapchat || '',
        },
        interests: profileData.interests?.join(', ') || '',
        hobbies: profileData.hobbies || [],
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      if (err.message === 'Authentication required') {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleHobbyToggle = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formDataData = new FormData();
    formDataData.append('image', file);
    try {
      setSaving(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // For file uploads, we need to use regular fetch since authenticatedFetch doesn't handle FormData well
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/user/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataData,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      
      setUser(prev => ({ ...prev, profileImage: result.imageUrl }));
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      userData.profileImage = result.imageUrl;
      localStorage.setItem('user', JSON.stringify(userData));
      setAvatarKey(Date.now()); // force reload
      setSuccess('Profile image updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      console.error('Error uploading image:', err);
      if (err.message === 'Authentication required') {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to upload image');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        socialMedia: formData.socialMedia,
        interests: formData.interests.split(',').map(interest => interest.trim()).filter(interest => interest),
        hobbies: formData.hobbies,
      };

      const response = await authenticatedFetch(`${apiUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update user context
      setUser(prev => ({
        ...prev,
        ...updatedUser
      }));

      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      Object.assign(userData, updatedUser);
      localStorage.setItem('user', JSON.stringify(userData));

      setSuccess('Profile updated successfully!');

      // Close the modal after successful save
      setTimeout(() => {
        onClose();
      }, 1000); // Give user time to see the success message

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Compose the image URL with cache busting
  const getProfileImageUrl = () => {
    let url = user?.profileImage;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // If we have a profile image URL, use it with the correct backend URL
    if (url && url.startsWith('/uploads/')) {
      return `${apiUrl}${url}?v=${avatarKey}`;
    }
    
    // Fallback to default avatar
    return DEFAULT_AVATAR + `?v=${avatarKey}`;
  };

  if (loading) {
    return (
      <div className="profile-modal">
        <div className="profile-content">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-modal ${isMobileKeyboard ? 'mobile-keyboard' : ''}`}>
      <div className="profile-content">
        <div className="profile-header">
          <h2>Edit Profile</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Profile Image Section */}
          <div className="profile-image-section">
            <div className="current-image avatar-hover">
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="profile-avatar"
                key={avatarKey}
                onError={(e) => {
                  console.error('Image failed to load:', e.target.src);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', getProfileImageUrl());
                }}
              />
              <label htmlFor="profile-image" className="avatar-upload-label">
                <FontAwesomeIcon icon={faCamera} className="avatar-upload-icon" />
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={saving}
                />
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="form-section">
            <h3>Social Media</h3>
            
            <div className="social-media-grid">
              <div className="form-group social-media-group">
                <FontAwesomeIcon icon={faFacebook} className="social-icon facebook" />
                <input
                  type="url"
                  id="facebook"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                  placeholder="Facebook profile URL"
                />
              </div>
              <div className="form-group social-media-group">
                <FontAwesomeIcon icon={faInstagram} className="social-icon instagram" />
                <input
                  type="url"
                  id="instagram"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                  placeholder="Instagram profile URL"
                />
              </div>
              <div className="form-group social-media-group">
                <FontAwesomeIcon icon={faTiktok} className="social-icon tiktok" />
                <input
                  type="url"
                  id="tiktok"
                  value={formData.socialMedia.tiktok}
                  onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                  placeholder="TikTok profile URL"
                />
              </div>
              <div className="form-group social-media-group">
                <FontAwesomeIcon icon={faSnapchat} className="social-icon snapchat" />
                <input
                  type="text"
                  id="snapchat"
                  value={formData.socialMedia.snapchat}
                  onChange={(e) => handleInputChange('socialMedia.snapchat', e.target.value)}
                  placeholder="Snapchat username"
                />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="form-section">
            <h3>Interests</h3>
            <div className="form-group">
              <label htmlFor="interests">Interests (comma-separated)</label>
              <textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                placeholder="e.g., reading, hiking, cooking, photography"
                rows="3"
              />
            </div>
          </div>

          {/* Hobbies */}
          <div className="form-section">
            <h3>Hobbies</h3>
            <div className="hobbies-grid">
              {availableHobbies.map((hobby) => (
                <label key={hobby} className="hobby-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.hobbies.includes(hobby)}
                    onChange={() => handleHobbyToggle(hobby)}
                  />
                  <span className="hobby-label">{hobby}</span>
                </label>
              ))}
            </div>
          </div>
        </form>

        {/* Form Actions - Moved outside form for better mobile layout */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose} 
            className="cancel-button"
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 