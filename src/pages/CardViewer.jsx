import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlipBook from '../components/flipbook';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LanguageProvider, useLanguage } from '../hooks/LanguageContext.jsx';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import '../styles/CardViewer.css';

const CardViewerContent = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [sharedCard, setSharedCard] = useState(null);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dynamic templates data from data provider
  const [templatesData, setTemplatesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load templates data on component mount
  useEffect(() => {
    const loadTemplatesData = async () => {
      try {
        const dataProvider = await import('../services/dataProvider.js').then(module => module.default);
        const templates = await dataProvider.getTemplatesData();
        setTemplatesData(templates);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load templates data:', error);
        setError('Failed to load templates');
        setLoading(false);
      }
    };

    loadTemplatesData();
  }, []);


  };

  useEffect(() => {
    fetchSharedCard();
  }, [shareId]);

  const fetchSharedCard = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/sharing/view/${shareId}`);
      const data = await response.json();

      if (data.success) {
        setSharedCard(data.sharedCard);
        // Fetch the actual design data
        await fetchDesign(data.sharedCard.designId);
      } else {
        setError(data.error || 'Card not found or expired');
      }
    } catch (err) {
      setError('Failed to load the shared card');
    } finally {
      setLoading(false);
    }
  };

  const fetchDesign = async (designId) => {
    try {
      // Check if designId is a template key (starts with 'temp') or a saved design ID
      const isTemplate = designId.startsWith('temp');
      
      if (isTemplate) {
        // Use the same template structure as the main website
        const templateData = templatesData[designId];
        if (templateData) {
          const templateDesign = {
            title: templateData.title,
            designData: {
              pages: templateData.pages,
              editedPages: {}
            }
          };
          setDesign(templateDesign);
        } else {
          setError('Template not found');
        }
      } else {
        // Fetch the actual saved design data
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/saved-designs/public/${designId}`);
        const data = await response.json();

        if (data.success) {
          setDesign(data.design);
        } else {
          setError('Failed to load design data');
        }
      }
    } catch (err) {
      setError('Failed to load design data');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="card-viewer-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your greeting card...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-viewer-container">
        <Header />
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Card Not Available</h2>
          <p>{error}</p>
          <button 
            className="back-button"
            onClick={() => navigate('/')}
          >
            Go to SmartWish
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="card-viewer-container">
      <Header />
      
      <div className="viewer-content">
        <div className="viewer-header">
          <h1>Greeting Card from {sharedCard?.recipientName}</h1>
          {sharedCard?.message && (
            <div className="personal-message">
              <p>"{sharedCard.message}"</p>
            </div>
          )}
        </div>

        <div className="flipbook-container">
          {design && (
            <FlipBook
              title={design.title || 'Greeting Card'}
              pages={design.designData.pages}
              editedPages={design.designData.editedPages || {}}
              onEditPageSave={() => {}}
            />
          )}
        </div>

        <div className="viewer-actions">
          <button 
            className="print-button"
            onClick={handlePrint}
          >
            🖨️ Print Card
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const CardViewer = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CardViewerContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default CardViewer; 