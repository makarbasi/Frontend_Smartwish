import React from 'react';
import FlipBook from './flipbook.jsx';
import '../styles/FlipbookModal.css';

const FlipbookModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  title, 
  pages, 
  editedPages, 
  onEditPageSave, 
  onPrint, 
  isPrinting, 
  isMobile, 
  mediaQRCode 
}) => {
  if (!isOpen) return null;

  return (
    <div className="flipbook-modal-overlay" onClick={onClose}>
      <div className="flipbook-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flipbook-modal-header">
          <h2 className="flipbook-modal-title">{title || 'Greeting Card'}</h2>
          <button className="flipbook-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="flipbook-modal-body">
          <FlipBook 
            title={title} 
            pages={pages} 
            editedPages={editedPages} 
            onEditPageSave={onEditPageSave}
            onPrint={onPrint}
            isPrinting={isPrinting}
            isMobile={isMobile}
            mediaQRCode={mediaQRCode}
          />
        </div>
        
        <div className="flipbook-modal-footer">
          <div className="flipbook-action-buttons">
            <button
              onClick={onPrint}
              className="flipbook-action-button flipbook-print-button"
              disabled={isPrinting}
            >
              {isMobile ? 'Share with Kiosk' : 'Print'}
            </button>
            <button
              onClick={onSave}
              className="flipbook-action-button flipbook-save-button"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipbookModal;
