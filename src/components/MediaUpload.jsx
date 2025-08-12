import React, { useState, useRef } from 'react';
import '../styles/MediaUpload.css';

const MediaUpload = ({ onSubmit, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid file type (images, videos, or documents)');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      await onSubmit({
        file: selectedFile,
        description: description.trim()
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType === 'text/plain') return '📄';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="media-upload-overlay">
      <div className="media-upload-modal">
        <div className="media-upload-header">
          <h2>Upload Media</h2>
          <button className="close-btn" onClick={handleCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="media-upload-form">
          <div className="upload-area">
            <div
              className={`drop-zone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              {!selectedFile ? (
                <div className="upload-prompt">
                  <div className="upload-icon">📤</div>
                  <h3>Drop files here or click to browse</h3>
                  <p>Supports images, videos, and documents (max 10MB)</p>
                  <button type="button" className="browse-btn">
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="file-preview">
                  {preview ? (
                    <img src={preview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="file-info">
                      <div className="file-icon">{getFileIcon(selectedFile.type)}</div>
                      <div className="file-details">
                        <div className="file-name">{selectedFile.name}</div>
                        <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                        <div className="file-type">{selectedFile.type}</div>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Add a description for this media file..."
            />
          </div>

          <div className="upload-info">
            <h4>Supported File Types:</h4>
            <div className="file-types">
              <div className="file-type-group">
                <span className="file-type-icon">🖼️</span>
                <span>Images: JPEG, PNG, GIF, WebP</span>
              </div>
              <div className="file-type-group">
                <span className="file-type-icon">🎥</span>
                <span>Videos: MP4, AVI, MOV, WMV</span>
              </div>
              <div className="file-type-group">
                <span className="file-type-icon">📄</span>
                <span>Documents: PDF, Word, Text</span>
              </div>
            </div>
            <div className="file-size-limit">
              <strong>Maximum file size: 10MB</strong>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaUpload; 