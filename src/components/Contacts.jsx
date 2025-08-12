import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ContactList from './ContactList';
import ContactForm from './ContactForm';
import ContactDetail from './ContactDetail';
import '../styles/Contacts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTelegram, faLinkedin, faGoogle, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const Contacts = ({ userId, onClose }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list', 'detail'
  const [showSocialImportOverlay, setShowSocialImportOverlay] = useState(false);
  const socialImportRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (userId) {
      fetchContacts();
    }
  }, [userId]);

  // Handle click outside to close social import overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (socialImportRef.current && !socialImportRef.current.contains(event.target)) {
        setShowSocialImportOverlay(false);
      }
    };

    if (showSocialImportOverlay) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSocialImportOverlay]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/contacts?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async (contactData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...contactData, userId }),
      });

      if (response.ok) {
        const newContact = await response.json();
        setContacts(prev => [...prev, newContact]);
        setIsFormOpen(false);
        setView('list');
      } else {
        console.error('Failed to create contact');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleUpdateContact = async (contactId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...updateData, userId }),
      });

      if (response.ok) {
        const updatedContact = await response.json();
        setContacts(prev => prev.map(c => c.id === contactId ? updatedContact : c));
        setSelectedContact(updatedContact);
      } else {
        console.error('Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${contactId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setContacts(prev => prev.filter(c => c.id !== contactId));
        setSelectedContact(null);
        setIsDetailOpen(false);
        setView('list');
      } else {
        console.error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSocialMediaImport = (platform) => {
    console.log(`Importing contacts from ${platform}`);
    // TODO: Implement actual social media import functionality
    setShowSocialImportOverlay(false);
    // For now, just show a placeholder message
    alert(`Import from ${platform} - Feature coming soon!`);
  };

  const toggleSocialImportOverlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle social import overlay clicked');
    setShowSocialImportOverlay(!showSocialImportOverlay);
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
    setView('detail');
  };



  if (loading) {
    return (
      <div className="contacts-modal-overlay">
        <div className="contacts-modal">
          <div className="loading">Loading contacts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-modal-overlay">
      <div className="contacts-modal">
        <div className="contacts-header">
          <h1>My Contacts</h1>
          <div className="contacts-actions">
            <div className="add-contact-group" ref={socialImportRef}>
              <button
                className="add-contact-btn primary"
                onClick={() => setIsFormOpen(true)}
                title="Add New Contact"
                aria-label="Add New Contact"
              >
                <FontAwesomeIcon icon={faPlus} size="lg" />
              </button>
              <button
                className="social-import-dropdown-btn"
                onClick={toggleSocialImportOverlay}
                title="Import from Social Media"
                aria-label="Import from Social Media"
                type="button"
              >
                <FontAwesomeIcon icon={faDownload} size="lg" />
              </button>
            </div>
            <button
              className="close-modal-btn"
              onClick={onClose}
              title="Close"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>
        </div>

        <div className="contacts-content">
          {view === 'detail' && selectedContact ? (
            <ContactDetail
              contact={selectedContact}
              onUpdate={handleUpdateContact}
              onDelete={handleDeleteContact}
              onClose={() => {
                setIsDetailOpen(false);
                setView('list');
              }}
            />
          ) : (
            <ContactList
              contacts={contacts}
              onContactSelect={handleContactSelect}
              onDeleteContact={handleDeleteContact}
            />
          )}
        </div>

        {isFormOpen && (
          <ContactForm
            onSubmit={handleCreateContact}
            onClose={() => setIsFormOpen(false)}
            mode="create"
          />
        )}
      </div>
      {/* Social Media Import Overlay - moved outside modal */}
        {showSocialImportOverlay && (
          <div className="social-import-overlay">
            <div className="social-import-content">
              <div className="social-import-header">
                <h3>Import Contacts</h3>
                <button
                  className="close-social-import"
                  onClick={() => setShowSocialImportOverlay(false)}
                >
                  ✕
                </button>
              </div>
              <p className="social-import-description">
              Import contact information from below social medias
              </p>
              <div className="social-media-buttons">
                <button
                  className="social-btn facebook-btn"
                  onClick={() => handleSocialMediaImport('Facebook')}
                >
                <FontAwesomeIcon icon={faFacebook} size="lg" className="social-icon" color="#1877f2" />
                  Facebook
                </button>
                <button
                  className="social-btn instagram-btn"
                  onClick={() => handleSocialMediaImport('Instagram')}
                >
                <FontAwesomeIcon icon={faInstagram} size="lg" className="social-icon" color="#E4405F" />
                  Instagram
                </button>
                <button
                className="social-btn telegram-btn"
                onClick={() => handleSocialMediaImport('Telegram')}
                >
                <FontAwesomeIcon icon={faTelegram} size="lg" className="social-icon" color="#229ED9" />
                Telegram
                </button>
                <button
                  className="social-btn linkedin-btn"
                  onClick={() => handleSocialMediaImport('LinkedIn')}
                >
                <FontAwesomeIcon icon={faLinkedin} size="lg" className="social-icon" color="#0077b5" />
                  LinkedIn
                </button>
                <button
                  className="social-btn google-btn"
                  onClick={() => handleSocialMediaImport('Google')}
                >
                <FontAwesomeIcon icon={faGoogle} size="lg" className="social-icon" color="#EA4335" />
                  Google
                </button>
                <button
                  className="social-btn whatsapp-btn"
                  onClick={() => handleSocialMediaImport('WhatsApp')}
                >
                <FontAwesomeIcon icon={faWhatsapp} size="lg" className="social-icon" color="#25D366" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Contacts; 