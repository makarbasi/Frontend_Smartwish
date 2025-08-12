import React from 'react';
import '../styles/EditorChoiceModal.css';
import { useLanguage } from '../hooks/LanguageContext.jsx';

const EditorChoiceModal = ({ isOpen, onClose, onChooseEditor, imageSrc }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleChooseEditor = (editorType) => {
    onChooseEditor(editorType, imageSrc);
    onClose();
  };

  return (
    <div className="editor-choice-modal-overlay" onClick={onClose}>
      <div className="editor-choice-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="editor-choice-modal-header">
          <h2>Choose Image Editor</h2>
          <button className="editor-choice-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="editor-choice-modal-body">
          <div className="editor-options">
            <div className="editor-option" onClick={() => handleChooseEditor('original')}>
              <div className="editor-option-icon">🎨</div>
              <div className="editor-option-content">
                <h3>Original Editor</h3>
                <p>Use the built-in image editor with AI-powered features, filters, and text tools.</p>
              </div>
            </div>
            
            <div className="editor-option" onClick={() => handleChooseEditor('pintura')}>
              <div className="editor-option-icon">✨</div>
              <div className="editor-option-content">
                <h3>Pintura Editor</h3>
                <p>Professional image editor with advanced tools, filters, and effects in a full-page view.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="editor-choice-modal-footer">
          <button className="editor-choice-cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorChoiceModal;
