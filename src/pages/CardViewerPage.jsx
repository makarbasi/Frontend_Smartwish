import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SharableFlipbook from '../components/SharableFlipbook.jsx';
import Header from '../components/Headers.jsx';
import Footer from '../components/Footer.jsx';
import { LanguageProvider, useLanguage } from '../hooks/LanguageContext.jsx';
import '../styles/CardViewerPage.css';

const CardViewerPageContent = () => {
  const { cardId } = useParams();
  const { t } = useLanguage();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cardId) {
      loadCardData();
    }
  }, [cardId]);

  const loadCardData = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/saved-designs/public/${cardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load card');
      }

      const data = await response.json();
      
      // Fix image paths to be absolute URLs
      if (data.designData && data.designData.pages) {
        data.designData.pages = data.designData.pages.map(page => {
          let imageUrl = page.image;
          
          // If it's already an absolute URL, use as-is
          if (imageUrl.startsWith('http')) {
            return { ...page, image: imageUrl };
          }
          
          // If it starts with /, it's a root-relative path
          if (imageUrl.startsWith('/')) {
            imageUrl = `${window.location.origin}${imageUrl}`;
          } else {
            // Otherwise, it's a relative path, prepend the origin
            imageUrl = `${window.location.origin}/${imageUrl}`;
          }
          
          console.log(`Original image path: ${page.image} -> Resolved to: ${imageUrl}`);
          return { ...page, image: imageUrl };
        });
      }
      
      setDesign(data);
    } catch (err) {
      console.error('Error loading card:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-viewer-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your card...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-viewer-page">
        <Header />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Card Not Available</h2>
          <p>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="card-viewer-page">
        <Header />
        <div className="error-container">
          <div className="error-icon">📄</div>
          <h2>Card Not Found</h2>
          <p>The requested card could not be found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="card-viewer-page">
      <Header />
      
      <div className="viewer-content">
        <div className="viewer-header">
          <h1>{design.title}</h1>
          {design.description && (
            <p className="card-description">{design.description}</p>
          )}
        </div>

        <SharableFlipbook 
          title={design.title} 
          pages={design.designData.pages} 
        />
      </div>

      <Footer />
    </div>
  );
};

const CardViewerPage = () => {
  return (
    <LanguageProvider>
      <CardViewerPageContent />
    </LanguageProvider>
  );
};

export default CardViewerPage; 