import React, { useState } from 'react';
import '../styles/ModalBase.css';
import '../styles/ShareCardModal.css';

const ShareCardModal = ({ isOpen, onClose, designId }) => {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/sharing/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: designId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ recipientEmail: '', message: '' });
        }, 2000);
      } else {
        setError(data.error || 'Failed to send card');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay">
      <div className="share-modal">
        <div className="share-modal-header">
          <h2>Email Your Card</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Card Sent Successfully!</h3>
            <p>Your greeting card has been sent to {formData.recipientEmail}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="share-form">
            <div className="form-group">
              <label htmlFor="recipientEmail">Recipient's Email *</label>
              <input
                type="email"
                id="recipientEmail"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleInputChange}
                required
                placeholder="Enter recipient's email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Personal Message (Optional)</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Add a personal message to your card..."
                rows="4"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="share-button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Card'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShareCardModal; 