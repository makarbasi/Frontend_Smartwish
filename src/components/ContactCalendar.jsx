import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ContactCalendar.css';

const ContactCalendar = ({ contacts, userId, onContactSelect }) => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (userId) {
      fetchUpcomingEvents();
    }
  }, [userId, selectedMonth]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/contacts/calendar/upcoming?userId=${userId}&days=90`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data);
      } else {
        console.error('Failed to fetch upcoming events');
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    return upcomingEvents.filter(({ event }) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === dateStr;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedMonth);
    const calendar = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      calendar.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-events' : ''}`}
        >
          <div className="day-number">{day}</div>
          {events.length > 0 && (
            <div className="day-events">
              {events.slice(0, 2).map(({ contact, event }, index) => (
                <div 
                  key={index} 
                  className="day-event"
                  onClick={() => onContactSelect(contact)}
                  title={`${contact.firstName} ${contact.lastName}: ${event.title}`}
                >
                  <span className="event-icon">
                    {event.type === 'birthday' ? '🎂' : 
                     event.type === 'anniversary' ? '💍' : 
                     event.type === 'graduation' ? '🎓' : 
                     event.type === 'wedding' ? '💒' : '📅'}
                  </span>
                  <span className="event-title">{event.title}</span>
                </div>
              ))}
              {events.length > 2 && (
                <div className="more-events">+{events.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return calendar;
  };

  const renderUpcomingList = () => {
    const sortedEvents = [...upcomingEvents].sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
    
    return (
      <div className="upcoming-events-list">
        <h3>Upcoming Events (Next 90 Days)</h3>
        {sortedEvents.length === 0 ? (
          <div className="no-events">
            <p>No upcoming events</p>
            <p>Add important dates to your contacts to see them here</p>
          </div>
        ) : (
          <div className="events-list">
            {sortedEvents.map(({ contact, event }, index) => {
              const eventDate = new Date(event.date);
              const now = new Date();
              const daysDiff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={index} 
                  className="upcoming-event-item"
                  onClick={() => onContactSelect(contact)}
                >
                  <div className="event-date-info">
                    <div className="event-date">{formatDate(eventDate)}</div>
                    <div className="event-days">
                      {daysDiff === 0 ? 'Today' : 
                       daysDiff === 1 ? 'Tomorrow' : 
                       daysDiff < 7 ? `In ${daysDiff} days` : 
                       `${daysDiff} days away`}
                    </div>
                  </div>
                  
                  <div className="event-details">
                    <div className="event-contact">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="event-title">{event.title}</div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                  </div>
                  
                  <div className="event-icon">
                    {event.type === 'birthday' ? '🎂' : 
                     event.type === 'anniversary' ? '💍' : 
                     event.type === 'graduation' ? '🎓' : 
                     event.type === 'wedding' ? '💒' : '📅'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="contact-calendar">
        <div className="loading">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="contact-calendar">
      <div className="calendar-header">
        <button className="nav-btn" onClick={() => navigateMonth(-1)}>‹</button>
        <h2>{getMonthName(selectedMonth)}</h2>
        <button className="nav-btn" onClick={() => navigateMonth(1)}>›</button>
      </div>

      <div className="calendar-container">
        <div className="calendar-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>
        
        <div className="calendar-grid">
          {renderCalendar()}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-icon">🎂</span>
          <span>Birthday</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">💍</span>
          <span>Anniversary</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🎓</span>
          <span>Graduation</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">💒</span>
          <span>Wedding</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">📅</span>
          <span>Other</span>
        </div>
      </div>

      {renderUpcomingList()}
    </div>
  );
};

export default ContactCalendar; 