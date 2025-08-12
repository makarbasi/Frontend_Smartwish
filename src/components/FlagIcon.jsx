import React from 'react';

export const SpanishFlag = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#AA151B"/>
    <rect y="8" width="24" height="8" fill="#F1BF00"/>
    <rect y="16" width="24" height="8" fill="#AA151B"/>
    <rect x="8" y="6" width="8" height="12" fill="#AA151B"/>
    <rect x="9" y="7" width="6" height="10" fill="#F1BF00"/>
    <circle cx="12" cy="12" r="2" fill="#AA151B"/>
  </svg>
);

export const USFlag = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#B22234"/>
    <rect y="2" width="24" height="2" fill="white"/>
    <rect y="6" width="24" height="2" fill="white"/>
    <rect y="10" width="24" height="2" fill="white"/>
    <rect y="14" width="24" height="2" fill="white"/>
    <rect y="18" width="24" height="2" fill="white"/>
    <rect y="22" width="24" height="2" fill="white"/>
    <rect width="10" height="14" fill="#3C3B6E"/>
    <circle cx="2" cy="3" r="0.5" fill="white"/>
    <circle cx="4" cy="3" r="0.5" fill="white"/>
    <circle cx="6" cy="3" r="0.5" fill="white"/>
    <circle cx="8" cy="3" r="0.5" fill="white"/>
    <circle cx="2" cy="5" r="0.5" fill="white"/>
    <circle cx="4" cy="5" r="0.5" fill="white"/>
    <circle cx="6" cy="5" r="0.5" fill="white"/>
    <circle cx="2" cy="7" r="0.5" fill="white"/>
    <circle cx="4" cy="7" r="0.5" fill="white"/>
    <circle cx="6" cy="7" r="0.5" fill="white"/>
    <circle cx="8" cy="7" r="0.5" fill="white"/>
    <circle cx="2" cy="9" r="0.5" fill="white"/>
    <circle cx="4" cy="9" r="0.5" fill="white"/>
    <circle cx="6" cy="9" r="0.5" fill="white"/>
    <circle cx="2" cy="11" r="0.5" fill="white"/>
    <circle cx="4" cy="11" r="0.5" fill="white"/>
    <circle cx="6" cy="11" r="0.5" fill="white"/>
    <circle cx="8" cy="11" r="0.5" fill="white"/>
  </svg>
);

export const FrenchFlag = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="8" height="24" fill="#002395"/>
    <rect x="8" width="8" height="24" fill="white"/>
    <rect x="16" width="8" height="24" fill="#ED2939"/>
  </svg>
);

export const SaudiFlag = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#006C35"/>
    <rect y="8" width="24" height="8" fill="white"/>
    <circle cx="12" cy="12" r="3" fill="#006C35"/>
    <path d="M12 9 L12 15 M9 12 L15 12" stroke="white" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export const IranianFlag = ({ size = 24 }) => (
  <img 
    src="/images/persian_flag.png" 
    alt="Iranian Flag" 
    width={size} 
    height={size}
    style={{ objectFit: 'cover', borderRadius: '2px' }}
  />
);

export const FlagIcon = ({ language, size = 24 }) => {
  switch (language) {
    case 'en':
      return <USFlag size={size} />;
    case 'es':
      return <SpanishFlag size={size} />;
    case 'fr':
      return <FrenchFlag size={size} />;
    case 'ar':
      return <SaudiFlag size={size} />;
    case 'fa':
      return <IranianFlag size={size} />;
    default:
      return <USFlag size={size} />;
  }
}; 