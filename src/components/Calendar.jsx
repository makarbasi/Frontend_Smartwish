import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ContactCalendar from './ContactCalendar';
import '../styles/Calendar.css';

const Calendar = ({ onClose }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (user?.id) {
      fetchContacts();
    }
  }, [user?.id]);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts?userId=${user.id}`, {
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

  if (loading) {
    return (
      <div className="calendar-modal-overlay">
        <div className="calendar-modal">
          <div className="loading">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-modal-overlay">
      <div className="calendar-modal">
        <div className="calendar-header">
          <h1>Calendar</h1>
          <button
            className="close-modal-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="calendar-content">
          <ContactCalendar
            contacts={contacts}
            userId={user?.id}
            onContactSelect={() => {}} // We can add contact selection functionality later
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
