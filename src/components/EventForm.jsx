import React, { useState } from 'react';
import '../styles/EventForm.css';

const EventForm = ({ event, onSubmit, onClose, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'birthday',
    date: '',
    description: '',
    isRecurring: true,
    reminderDays: 7
  });

  const [errors, setErrors] = useState({});

  const eventTypes = [
    { value: 'birthday', label: '🎂 Birthday', defaultRecurring: true },
    { value: 'anniversary', label: '💍 Anniversary', defaultRecurring: true },
    { value: 'graduation', label: '🎓 Graduation', defaultRecurring: false },
    { value: 'wedding', label: '💒 Wedding', defaultRecurring: false },
    { value: 'custom', label: '📅 Custom Event', defaultRecurring: false }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today && !formData.isRecurring) {
        newErrors.date = 'Event date cannot be in the past for non-recurring events';
      }
    }

    if (formData.reminderDays < 0 || formData.reminderDays > 365) {
      newErrors.reminderDays = 'Reminder days must be between 0 and 365';
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

    // Auto-set recurring based on event type
    if (field === 'type') {
      const eventType = eventTypes.find(et => et.value === value);
      if (eventType) {
        setFormData(prev => ({
          ...prev,
          type: value,
          isRecurring: eventType.defaultRecurring
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleCancel = () => {
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="event-form-overlay">
      <div className="event-form-modal">
        <div className="event-form-header">
          <h2>{mode === 'create' ? 'Add New Event' : 'Edit Event'}</h2>
          <button className="close-btn" onClick={handleCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="e.g., John's Birthday, Wedding Anniversary"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Event Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Event Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'error' : ''}
                min={getMinDate()}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="3"
              placeholder="Add any additional details about this event..."
            />
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                />
                <span className="checkmark"></span>
                Recurring Event (e.g., annual birthday)
              </label>
              <div className="checkbox-help">
                Check this for events that happen every year
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reminderDays">Reminder (days before)</label>
              <input
                type="number"
                id="reminderDays"
                value={formData.reminderDays}
                onChange={(e) => handleInputChange('reminderDays', parseInt(e.target.value) || 0)}
                className={errors.reminderDays ? 'error' : ''}
                min="0"
                max="365"
              />
              {errors.reminderDays && <span className="error-message">{errors.reminderDays}</span>}
              <div className="input-help">
                How many days before the event should you be reminded?
              </div>
            </div>
          </div>

          <div className="event-preview">
            <h4>Event Preview</h4>
            <div className="preview-content">
              <div className="preview-title">{formData.title || 'Event Title'}</div>
              <div className="preview-date">
                {formData.date ? new Date(formData.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Select a date'}
              </div>
              <div className="preview-type">
                {eventTypes.find(et => et.value === formData.type)?.label || 'Event Type'}
              </div>
              {formData.isRecurring && (
                <div className="preview-recurring">🔄 Annual Event</div>
              )}
              {formData.description && (
                <div className="preview-description">{formData.description}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {mode === 'create' ? 'Add Event' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm; 