import React from 'react';
import '../styles/ContactList.css';

const ContactList = ({ contacts, onContactSelect, onDeleteContact }) => {
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  const getUpcomingEvents = (contact) => {
    if (!contact.events || contact.events.length === 0) return null;
    
    const now = new Date();
    const upcoming = contact.events.filter(event => {
      const eventDate = new Date(event.date);
      const nextOccurrence = new Date(eventDate);
      
      if (event.isRecurring) {
        // For recurring events, find the next occurrence
        nextOccurrence.setFullYear(now.getFullYear());
        if (nextOccurrence < now) {
          nextOccurrence.setFullYear(now.getFullYear() + 1);
        }
      }
      
      const daysDiff = Math.ceil((nextOccurrence - now) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 30; // Show events in next 30 days
    });
    
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const formatEventDate = (date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Tomorrow';
    if (daysDiff < 7) return `In ${daysDiff} days`;
    
    return eventDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (contacts.length === 0) {
    return (
      <div className="contact-list-empty">
        <div className="empty-icon">👥</div>
        <h3>No contacts found</h3>
        <p>Start by adding your first contact to keep track of important events and information.</p>
        <p className="empty-hint">Use the "Add Contact" button above to get started.</p>
      </div>
    );
  }

  return (
    <div className="contact-list">
      {contacts.map((contact) => {
        const upcomingEvent = getUpcomingEvents(contact);
        
        return (
          <div key={contact.id} className="contact-item">
            <div className="contact-avatar">
              {contact.profileImage ? (
                <img src={contact.profileImage} alt={`${contact.firstName} ${contact.lastName}`} />
              ) : (
                <div className="contact-initials">
                  {getInitials(contact.firstName, contact.lastName)}
                </div>
              )}
            </div>
            
            <div className="contact-info" onClick={() => onContactSelect(contact)}>
              <div className="contact-name">
                {contact.firstName} {contact.lastName}
              </div>
              
              <div className="contact-details">
                {contact.email && (
                  <div className="contact-email">📧 {contact.email}</div>
                )}
                {contact.phoneNumber && (
                  <div className="contact-phone">📞 {contact.phoneNumber}</div>
                )}
                {contact.relationship && (
                  <div className="contact-relationship">👥 {contact.relationship}</div>
                )}
              </div>
              
              {upcomingEvent && (
                <div className="contact-upcoming-event">
                  <span className="event-icon">🎉</span>
                  <span className="event-title">{upcomingEvent.title}</span>
                  <span className="event-date">{formatEventDate(upcomingEvent.date)}</span>
                </div>
              )}
            </div>
            
            <div className="contact-actions">
              <button 
                className="contact-edit-btn"
                onClick={() => onContactSelect(contact)}
                title="View Details"
              >
                👁️
              </button>
              <button 
                className="contact-delete-btn"
                onClick={() => onDeleteContact(contact.id)}
                title="Delete Contact"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList; 