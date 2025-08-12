import React, { useState, useEffect } from 'react';
import '../styles/SharedCardViewer.css';
import SharableFlipbook from './SharableFlipbook.jsx';

const SharedCardViewer = ({ shareId }) => {
  const [sharedCard, setSharedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [designData, setDesignData] = useState(null);

  useEffect(() => {
    const fetchSharedCard = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        
        // Fetch the shared card data
        const response = await fetch(`${apiUrl}/api/sharing/view/${shareId}`);
        const data = await response.json();

        if (data.success && data.sharedCard) {
          setSharedCard(data.sharedCard);
          
          // Check if designId is a template key (starts with 'temp') or a saved design ID
          const isTemplate = data.sharedCard.designId.startsWith('temp');
          
          if (isTemplate) {
            // For templates, we need to create the design data from the template
            // Templates are simple image files, so we'll create a basic design structure
            const templateDesign = {
              title: `Greeting Card`,
              pages: [
                {
                  imageUrl: `/images/${data.sharedCard.designId}.jpg`,
                  header: 'Greeting Card',
                  text: 'A beautiful greeting card created with SmartWish',
                  footer: 'SmartWish'
                }
              ]
            };
            setDesignData(templateDesign);
          } else {
            // Fetch the actual saved design data
            const designResponse = await fetch(`${apiUrl}/api/saved-designs/public/${data.sharedCard.designId}`);
            const designData = await designResponse.json();
            
            if (designData.success) {
              setDesignData(designData.design);
            } else {
              setError('Design not found');
            }
          }
        } else {
          setError(data.error || 'Card not found or expired');
        }
      } catch (err) {
        console.error('Error fetching shared card:', err);
        setError('Failed to load card');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedCard();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="shared-card-viewer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your greeting card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-card-viewer">
        <div className="error-container">
          <h2>Card Not Available</h2>
          <p>{error}</p>
          <p>The card may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  if (!sharedCard || !designData) {
    return (
      <div className="shared-card-viewer">
        <div className="error-container">
          <h2>Card Not Found</h2>
          <p>Unable to load the greeting card.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-card-viewer">
      <div className="card-header">
        <h1>SmartWish</h1>
        <p>Digital Greeting Cards</p>
      </div>
      
      <div className="card-content">
        <div className="card-info">
          <h2>You received a greeting card!</h2>
          <p><strong>From:</strong> {sharedCard.recipientName}</p>
          {sharedCard.message && (
            <div className="message">
              <p><em>"{sharedCard.message}"</em></p>
            </div>
          )}
        </div>
        
        <div className="card-display">
          {designData.pages && designData.pages.length > 0 ? (
            <SharableFlipbook 
              pages={designData.pages}
              title={designData.title || "Shared Greeting Card"}
            />
          ) : (
            <div className="no-pages">
              <p>No pages found in this design.</p>
            </div>
          )}
        </div>
        
        <div className="card-footer">
          <p>This card was shared with you via SmartWish</p>
          <p>Link expires: {new Date(sharedCard.expiresAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SharedCardViewer; 