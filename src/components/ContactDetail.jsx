import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ContactForm from './ContactForm';
import EventForm from './EventForm';
import MediaUpload from './MediaUpload';
import '../styles/ContactDetail.css';
import { useLanguage } from '../hooks/LanguageContext.jsx';

const ContactDetail = ({ contact, onUpdate, onDelete, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'events', 'media', 'social'

  const API_BASE_URL = '';

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUpcomingEvents = () => {
    if (!contact.events || contact.events.length === 0) return [];
    
    const now = new Date();
    return contact.events.filter(event => {
      const eventDate = new Date(event.date);
      const nextOccurrence = new Date(eventDate);
      
      if (event.isRecurring) {
        nextOccurrence.setFullYear(now.getFullYear());
        if (nextOccurrence < now) {
          nextOccurrence.setFullYear(now.getFullYear() + 1);
        }
      }
      
      const daysDiff = Math.ceil((nextOccurrence - now) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleUpdateContact = async (updateData) => {
    await onUpdate(contact.id, updateData);
    setIsEditMode(false);
  };

  const handleAddEvent = async (eventData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contact.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const newEvent = await response.json();
        // Update the contact with the new event
        const updatedContact = {
          ...contact,
          events: [...(contact.events || []), newEvent]
        };
        onUpdate(contact.id, updatedContact);
        setIsEventFormOpen(false);
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm(t('areYouSureDeleteEvent'))) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contacts/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const updatedContact = {
          ...contact,
          events: contact.events.filter(e => e.id !== eventId)
        };
        onUpdate(contact.id, updatedContact);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleAddMedia = async (mediaData) => {
    try {
      const formData = new FormData();
      formData.append('file', mediaData.file);
      formData.append('description', mediaData.description || '');

      const response = await fetch(`${API_BASE_URL}/contacts/${contact.id}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newMedia = await response.json();
        const updatedContact = {
          ...contact,
          media: [...(contact.media || []), newMedia]
        };
        onUpdate(contact.id, updatedContact);
        setIsMediaUploadOpen(false);
      }
    } catch (error) {
      console.error('Error adding media:', error);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm(t('areYouSureDeleteMedia'))) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contacts/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const updatedContact = {
          ...contact,
          media: contact.media.filter(m => m.id !== mediaId)
        };
        onUpdate(contact.id, updatedContact);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="contact-detail-overlay">
      <div className="contact-detail-modal">
        <div className="contact-detail-header">
          <div className="contact-detail-avatar">
            {contact.profileImage ? (
              <img src={contact.profileImage} alt={`${contact.firstName} ${contact.lastName}`} />
            ) : (
              <div className="contact-detail-initials">
                {getInitials(contact.firstName, contact.lastName)}
              </div>
            )}
          </div>
          
          <div className="contact-detail-title">
            <h2>{contact.firstName} {contact.lastName}</h2>
            {contact.relationship && (
              <span className="contact-relationship">{contact.relationship}</span>
            )}
          </div>
          
          <div className="contact-detail-actions">
            <button 
              className="edit-btn"
              onClick={() => setIsEditMode(true)}
              title={t('editContact')}
            >
              ✏️
            </button>
            <button 
              className="delete-btn"
              onClick={() => onDelete(contact.id)}
              title={t('deleteContact')}
            >
              🗑️
            </button>
            <button 
              className="close-btn"
              onClick={onClose}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="contact-detail-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            📋 {t('contactInformation')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            📅 {t('importantEvents')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            📷 {t('mediaFiles')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            🌐 {t('socialMedia')}
          </button>
        </div>

        <div className="contact-detail-content">
          {activeTab === 'info' && (
            <div className="info-tab">
              <div className="info-section">
                <h3>{t('contactInformation')}</h3>
                {contact.email && (
                  <div className="info-item">
                    <span className="info-label">📧 {t('email')}:</span>
                    <span className="info-value">{contact.email}</span>
                  </div>
                )}
                {contact.phoneNumber && (
                  <div className="info-item">
                    <span className="info-label">📞 {t('phone')}:</span>
                    <span className="info-value">{contact.phoneNumber}</span>
                  </div>
                )}
                {contact.address && (
                  <div className="info-item">
                    <span className="info-label">📍 {t('address')}:</span>
                    <span className="info-value">{contact.address}</span>
                  </div>
                )}
              </div>

              {(contact.occupation || contact.company) && (
                <div className="info-section">
                  <h3>{t('professional')}</h3>
                  {contact.occupation && (
                    <div className="info-item">
                      <span className="info-label">💼 {t('occupation')}:</span>
                      <span className="info-value">{contact.occupation}</span>
                    </div>
                  )}
                  {contact.company && (
                    <div className="info-item">
                      <span className="info-label">🏢 {t('company')}:</span>
                      <span className="info-value">{contact.company}</span>
                    </div>
                  )}
                </div>
              )}

              {(contact.interests?.length > 0 || contact.hobbies?.length > 0) && (
                <div className="info-section">
                  <h3>{t('personal')}</h3>
                  {contact.interests?.length > 0 && (
                    <div className="info-item">
                      <span className="info-label">🎯 {t('interests')}:</span>
                      <span className="info-value">{contact.interests.join(', ')}</span>
                    </div>
                  )}
                  {contact.hobbies?.length > 0 && (
                    <div className="info-item">
                      <span className="info-label">🎨 {t('hobbies')}:</span>
                      <span className="info-value">{contact.hobbies.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {contact.notes && (
                <div className="info-section">
                  <h3>{t('notes')}</h3>
                  <div className="info-notes">{contact.notes}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="events-tab">
              <div className="events-header">
                <h3>{t('importantEvents')}</h3>
                <button 
                  className="add-event-btn"
                  onClick={() => setIsEventFormOpen(true)}
                >
                  ➕ {t('addEvent')}
                </button>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="no-events">
                  <p>{t('noUpcomingEvents')}</p>
                  <p>{t('addImportantDates')}</p>
                </div>
              ) : (
                <div className="events-list">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="event-item">
                      <div className="event-info">
                        <div className="event-title">{event.title}</div>
                        <div className="event-date">{formatDate(event.date)}</div>
                        {event.description && (
                          <div className="event-description">{event.description}</div>
                        )}
                        <div className="event-type">
                          {event.isRecurring ? `🔄 ${t('recurring')}` : `📅 ${t('oneTime')}`}
                        </div>
                      </div>
                      <button 
                        className="delete-event-btn"
                        onClick={() => handleDeleteEvent(event.id)}
                        title={t('deleteEvent')}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="media-tab">
              <div className="media-header">
                <h3>{t('mediaFiles')}</h3>
                <button 
                  className="add-media-btn"
                  onClick={() => setIsMediaUploadOpen(true)}
                >
                  📤 {t('uploadMedia')}
                </button>
              </div>

              {(!contact.media || contact.media.length === 0) ? (
                <div className="no-media">
                  <p>{t('noMediaFiles')}</p>
                  <p>{t('uploadPhotosVideos')}</p>
                </div>
              ) : (
                <div className="media-grid">
                  {contact.media.map((media) => (
                    <div key={media.id} className="media-item">
                      {media.type === 'image' ? (
                        <img 
                          src={`${API_BASE_URL}/contacts/media/${media.id}`}
                          alt={media.description || media.originalName}
                        />
                      ) : (
                        <div className="media-placeholder">
                          📄 {media.originalName}
                        </div>
                      )}
                      <div className="media-info">
                        <div className="media-name">{media.originalName}</div>
                        {media.description && (
                          <div className="media-description">{media.description}</div>
                        )}
                      </div>
                      <button 
                        className="delete-media-btn"
                        onClick={() => handleDeleteMedia(media.id)}
                        title={t('deleteMedia')}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="social-tab">
              <h3>{t('socialMedia')}</h3>
              {contact.socialMedia && Object.keys(contact.socialMedia).some(key => contact.socialMedia[key]) ? (
                <div className="social-links">
                  {contact.socialMedia.facebook && (
                    <a href={contact.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                      📘 {t('facebook')}
                    </a>
                  )}
                  {contact.socialMedia.instagram && (
                    <a href={contact.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      📷 {t('instagram')}
                    </a>
                  )}
                  {contact.socialMedia.twitter && (
                    <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                      🐦 {t('twitter')}
                    </a>
                  )}
                  {contact.socialMedia.linkedin && (
                    <a href={contact.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                      💼 {t('linkedin')}
                    </a>
                  )}
                  {contact.socialMedia.tiktok && (
                    <a href={contact.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="social-link tiktok">
                      🎵 {t('tiktok')}
                    </a>
                  )}
                  {contact.socialMedia.snapchat && (
                    <div className="social-link snapchat">
                      👻 {t('snapchat')}: {contact.socialMedia.snapchat}
                    </div>
                  )}
                  {contact.socialMedia.whatsapp && (
                    <div className="social-link whatsapp">
                      💬 {t('whatsapp')}: {contact.socialMedia.whatsapp}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-social">
                  <p>{t('noSocialMediaLinks')}</p>
                  <p>{t('addSocialMediaProfiles')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditMode && (
          <ContactForm
            contact={contact}
            onSubmit={handleUpdateContact}
            onClose={() => setIsEditMode(false)}
            mode="edit"
          />
        )}

        {isEventFormOpen && (
          <EventForm
            onSubmit={handleAddEvent}
            onClose={() => setIsEventFormOpen(false)}
          />
        )}

        {isMediaUploadOpen && (
          <MediaUpload
            onSubmit={handleAddMedia}
            onClose={() => setIsMediaUploadOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ContactDetail; 