import React from 'react';
import '../styles/Footer.css'; // We'll create this CSS file
import { useLanguage } from '../hooks/LanguageContext.jsx';
import pkg from '../../package.json';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© {currentYear} SmartWish. {t('allRightsReserved')} <span style={{fontSize: '0.9em', color: '#888'}}>v{pkg.version}</span></p>
        {/* Add other footer links or info if needed */}
        {/* <nav>
          <a href="/privacy">{t('privacyPolicy')}</a>
          <a href="/terms">{t('termsOfService')}</a>
        </nav> */}
      </div>
    </footer>
  );
};

export default Footer;