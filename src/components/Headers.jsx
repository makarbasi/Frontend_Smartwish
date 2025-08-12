// --- START OF FILE Header.js ---

import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import { faQrcode, faCreditCard, faSignOutAlt, faBars, faTimes, faFolder, faUser, faAddressBook, faGift, faChevronDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLanguage } from '../hooks/LanguageContext.jsx';
import { FlagIcon } from "./FlagIcon.jsx";

const Header = ({ onScannerClick, isMobile, onLogout, onSaveDesign, onShowSavedDesigns, onProfileClick, onContactsClick, onCalendarClick, onMarketplaceClick, user }) => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
    { code: 'fa', label: 'فارسی' }
  ];

  const currentLanguageData = languageOptions.find(lang => lang.code === currentLanguage);

  // Handle RTL for Arabic and Farsi
  useEffect(() => {
    if (currentLanguage === 'ar' || currentLanguage === 'fa') {
      document.body.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.body.removeAttribute('dir');
      document.body.classList.remove('rtl');
    }
  }, [currentLanguage]);

  // Handle clicking outside language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageDropdownOpen && !event.target.closest('.language-selector')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageDropdownOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  };

  const handleNavClick = (callback) => {
    callback();
    setIsMenuOpen(false); // Close menu after clicking
  };

  // Get first name only
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Hamburger Menu Button - moved to left */}
        <button 
          className="hamburger-button" 
          onClick={toggleMenu}
          title="Menu"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>
        
        <div className="navbar-logo">
          <img 
            src="/images/SmartWish.png" 
            alt="SmartWish" 
            className="logo-image"
          />
        </div>
        
        <div className="navbar-menu">
          <div className="language-selector">
            <button 
              className="language-trigger"
              onClick={toggleLanguageDropdown}
              title={t('selectLanguage')}
            >
              <FlagIcon language={currentLanguage} size={20} />
              <span className="language-code">{currentLanguageData?.code.toUpperCase()}</span>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`language-chevron ${isLanguageDropdownOpen ? 'open' : ''}`}
              />
            </button>
            
            {isLanguageDropdownOpen && (
              <div className="language-dropdown">
                {languageOptions.map(option => (
                  <button
                    key={option.code}
                    className={`language-option ${option.code === currentLanguage ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect(option.code)}
                  >
                    <FlagIcon language={option.code} size={20} />
                    <span className="language-label">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {user && (
            <div className="user-section">
              <span className="user-name">Hello, {getFirstName(user.name)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Navigation Menu */}
      <div className={`nav-dropdown ${isMenuOpen ? 'open' : ''}`}>
        <div className="nav-dropdown-content">
          {user && (
            <button 
              onClick={() => handleNavClick(onProfileClick)} 
              className="nav-dropdown-item"
              title={t('profile')}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>{t('profile')}</span>
            </button>
          )}
          
          {user && (
            <button 
              onClick={() => handleNavClick(onContactsClick)} 
              className="nav-dropdown-item"
              title={t('contacts')}
            >
              <FontAwesomeIcon icon={faAddressBook} />
              <span>{t('contacts')}</span>
            </button>
          )}
          
          <button
            onClick={() => handleNavClick(onMarketplaceClick)}
            className="nav-dropdown-item"
            title={t('giftMarketplace')}
          >
            <FontAwesomeIcon icon={faGift} />
            <span>{t('giftMarketplace')}</span>
          </button>

          {user && (
            <button
              onClick={() => handleNavClick(onCalendarClick)}
              className="nav-dropdown-item"
              title={t('calendar')}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{t('calendar')}</span>
            </button>
          )}

          {user && (
            <button 
              onClick={() => handleNavClick(onShowSavedDesigns)} 
              className="nav-dropdown-item"
              title={t('myCards')}
            >
              <FontAwesomeIcon icon={faFolder} />
              <span>{t('myCards')}</span>
            </button>
          )}
          
          {!isMobile && (
            <button 
              onClick={() => handleNavClick(onScannerClick)} 
              className="nav-dropdown-item"
              title={t('scanQRCode')}
            >
              <FontAwesomeIcon icon={faQrcode} />
              <span>{t('scanQRCode')}</span>
            </button>
          )}
          
          {user && (
            <button 
              onClick={() => handleNavClick(onLogout)} 
              className="nav-dropdown-item"
              title={t('logout')}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>{t('logout')}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
// --- END OF FILE Header.js ---