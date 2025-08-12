import React, { useState, useCallback } from 'react';
import { PinturaEditor } from '@pqina/react-pintura';
import { createDefaultImageReader, createDefaultImageWriter, createDefaultImageOrienter } from '@pqina/pintura';
import '@pqina/pintura/pintura.css';
import '../styles/PinturaModal.css';
import { useLanguage } from '../hooks/LanguageContext.jsx';

const PinturaModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editorState, setEditorState] = useState(null);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleClose = useCallback(() => {
    setImageSrc(null);
    setImageFile(null);
    setEditorState(null);
    setIsEditorLoading(false);
    setEditorError(null);
    setShowEditor(false);
    onClose();
  }, [onClose]);

  const handleSave = useCallback((result) => {
    console.log('Pintura save result:', result);
    if (onSave && result) {
      // If we have a processed result, use it; otherwise use the current image
      const imageToSave = result.dest || result.src || imageSrc;
      onSave(imageToSave);
    }
    handleClose();
  }, [onSave, handleClose, imageSrc]);

  const handleLoadImage = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File read successfully, data URL length:', e.target.result.length);
        console.log('Data URL preview:', e.target.result.substring(0, 100) + '...');
        setImageSrc(e.target.result);
        setImageFile(file);
        setIsEditorLoading(true);
        setEditorError(null);
      };
      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        alert('Error reading image file');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="pintura-modal-overlay" onClick={handleClose}>
      <div className="pintura-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pintura-modal-header">
          <h2 className="pintura-modal-title">{t('pinturaTitle')}</h2>
          <button className="pintura-modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>
        
                 <div className="pintura-modal-body">
           {!showEditor ? (
             <div className="pintura-upload-section">
               <div className="pintura-upload-area">
                 <h3 style={{ marginBottom: '20px', color: '#333' }}>Welcome to Pintura Editor</h3>
                 <p style={{ marginBottom: '30px', color: '#666' }}>
                   Click the button below to open the professional image editor with all tools available.
                 </p>
                 <button
                   onClick={() => setShowEditor(true)}
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     border: 'none',
                     padding: '15px 30px',
                     borderRadius: '25px',
                     fontSize: '16px',
                     fontWeight: '600',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease'
                   }}
                 >
                   Open Pintura Editor
                 </button>
               </div>
             </div>
           ) : (
                                     <div className="pintura-editor-container">
               {/* Image Upload Section */}
               {!imageSrc && (
                 <div className="pintura-image-upload-section" style={{ 
                   textAlign: 'center', 
                   padding: '40px 20px',
                   border: '2px dashed #ddd',
                   borderRadius: '12px',
                   margin: '20px',
                   background: '#f8f9fa'
                 }}>
                   <h4 style={{ marginBottom: '15px', color: '#333' }}>Load an Image to Edit</h4>
                   <p style={{ marginBottom: '20px', color: '#666' }}>
                     Upload an image to start editing with all Pintura tools
                   </p>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleLoadImage}
                     id="pintura-image-input"
                     style={{ display: 'none' }}
                   />
                   <label 
                     htmlFor="pintura-image-input" 
                     style={{
                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                       color: 'white',
                       border: 'none',
                       padding: '12px 24px',
                       borderRadius: '20px',
                       fontSize: '14px',
                       fontWeight: '600',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       display: 'inline-block'
                     }}
                   >
                     Choose Image File
                   </label>
                 </div>
               )}
               
               {isEditorLoading && (
                 <div className="pintura-loading">
                   <div className="pintura-loading-spinner"></div>
                   <p>Loading editor...</p>
                 </div>
               )}
               
               {editorError && (
                 <div className="pintura-error">
                   <p>Error: {editorError}</p>
                   <button onClick={() => setEditorError(null)}>Try Again</button>
                 </div>
               )}
               
                              {/* Pintura Editor */}
               <PinturaEditor
                 src={imageFile || imageSrc || undefined}
                 locale={{
                   locale: 'en-US',
                   label: 'English'
                 }}
                 imageReader={createDefaultImageReader()}
                 imageWriter={createDefaultImageWriter()}
                 imageOrienter={createDefaultImageOrienter()}
                 // Initialize editor without image first
                 onLoad={(editor) => {
                   console.log('Pintura editor loaded:', editor);
                   console.log('Editor element:', editor.element);
                   console.log('Editor container:', editor.container);
                   console.log('Editor src:', editor.src);
                   
                   // If we have an image, load it into the editor
                   if (imageFile || imageSrc) {
                     console.log('Loading image into editor...');
                     // The editor should automatically load the image when src changes
                   }
                   
                   setIsEditorLoading(false);
                   setEditorError(null);
                 }}
                 onProcess={({ dest }) => {
                   console.log('Pintura process result:', dest);
                   setEditorState(dest);
                 }}
                 onError={(error) => {
                   console.error('Pintura editor error:', error);
                   setEditorError(error.message || 'An error occurred in the editor');
                   setIsEditorLoading(false);
                 }}
                 onClose={handleClose}
                 onSave={handleSave}
                 style={{
                   width: '100%',
                   height: '500px',
                   display: 'block'
                 }}
               />
            </div>
          )}
        </div>
        
                 {showEditor && (
           <div className="pintura-modal-footer">
             <div className="pintura-action-buttons">
               <button
                 onClick={() => {
                   setShowEditor(false);
                   setImageSrc(null);
                   setImageFile(null);
                   setEditorState(null);
                   setIsEditorLoading(false);
                   setEditorError(null);
                 }}
                 className="pintura-action-button pintura-reset-button"
               >
                 Back to Menu
               </button>
               
               {imageSrc && (
                 <>
                   <button
                     onClick={() => {
                       setImageSrc(null);
                       setImageFile(null);
                       setEditorState(null);
                       setIsEditorLoading(false);
                       setEditorError(null);
                     }}
                     className="pintura-action-button pintura-reset-button"
                   >
                     Load New Image
                   </button>
                   <button
                     onClick={() => handleSave(editorState || imageSrc)}
                     className="pintura-action-button pintura-save-button"
                   >
                     {t('pinturaSaveEditedImage')}
                   </button>
                 </>
               )}
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default PinturaModal;
