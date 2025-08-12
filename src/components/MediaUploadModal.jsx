import React, { useState, useRef, useEffect, useCallback } from 'react';
import "../styles/ModalBase.css";
import "../styles/MediaUploadModal.css";
import { useLanguage } from '../hooks/LanguageContext.jsx';

const MediaUploadModal = ({ isOpen, onClose, onMediaUpload, qrCodeValue }) => {
  const { t } = useLanguage();
  const [uploadType, setUploadType] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [existingMedia, setExistingMedia] = useState(null);
  const [isCheckingMedia, setIsCheckingMedia] = useState(false);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  // Cleanup function to stop streams when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const checkExistingMedia = useCallback(async () => {
    if (!qrCodeValue) return;
    
    setIsCheckingMedia(true);
    try {
      // Extract timestamp and ID from QR code
      const timestampAndId = qrCodeValue.split('/add-media/')[1];
      if (!timestampAndId) return;

      const response = await fetch(`/validate-media-qr/${timestampAndId}`);
      if (response.ok) {
        const result = await response.json();
        setExistingMedia(result);
        console.log('Existing media info:', result);
      }
    } catch (error) {
      console.error('Error checking existing media:', error);
      setExistingMedia(null);
    } finally {
      setIsCheckingMedia(false);
    }
  }, [qrCodeValue]);

  // Check for existing media when QR code changes
  useEffect(() => {
    if (qrCodeValue && qrCodeValue.includes('/add-media/')) {
      checkExistingMedia();
    } else {
      setExistingMedia(null);
    }
  }, [qrCodeValue, checkExistingMedia]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleMediaUpload(file);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setMediaBlob(blob);
        setIsRecording(false);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      console.log(t('errorStartingAudioRecording'));
    }
  };

  const startVideoRecording = async () => {
    try {
      console.log('Starting video recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      console.log('Stream obtained:', stream);
      streamRef.current = stream;
      
      // Set recording state first so video element is rendered
      setIsRecording(true);
      
      // Use setTimeout to ensure the video element is rendered before setting stream
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting video srcObject...');
          videoRef.current.srcObject = stream;
          
          // Wait for the video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded, starting playback...');
            videoRef.current.play().catch(e => {
              console.error('Error playing video:', e);
            });
          };
          
          videoRef.current.onerror = (e) => {
            console.error('Video element error:', e);
          };
        } else {
          console.error('Video ref still not available after timeout');
        }
      }, 100);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') 
          ? 'video/webm;codecs=vp8,opus' 
          : 'video/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating blob...');
        const blob = new Blob(chunks, { type: 'video/webm' });
        setMediaBlob(blob);
        setIsRecording(false);
        
        // Stop video preview
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      console.log('Video recording started successfully');
    } catch (error) {
      console.error('Error starting video recording:', error);
      console.log(t('errorStartingVideoRecording'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Stop video preview
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const handleMediaUpload = async (file) => {
    if (!qrCodeValue) {
      console.log(t('noQRCodeValue'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('qrCode', qrCodeValue);

      console.log('Uploading media with QR code:', qrCodeValue);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      const response = await fetch('/upload-media', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log(t('mediaUploadedSuccessfully'));
        console.log('Media upload result:', result);
        onMediaUpload(result);
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      console.log(t('errorUploadingMediaTryAgain'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveRecording = () => {
    if (mediaBlob) {
      const file = new File([mediaBlob], `recording-${Date.now()}.${uploadType === 'audio' ? 'wav' : 'webm'}`, {
        type: mediaBlob.type
      });
      handleMediaUpload(file);
    }
  };

  const handleUploadTypeChange = (type) => {
    setUploadType(type);
    setMediaBlob(null);
    setIsRecording(false);
    
    // Start recording immediately if video is selected
    if (type === 'video') {
      startVideoRecording();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="media-upload-modal">
      <div className="media-upload-content">
        <div className="modal-header">
          <h2>{t('addMediaToFlipbook')}</h2>
          <p className="modal-subtitle">{t('uploadFilesOrRecord')}</p>
          
          {/* Existing Media Information */}
          {isCheckingMedia && (
            <div className="existing-media-info loading">
              <p>{t('checkingExistingMedia')}</p>
            </div>
          )}
          
          {existingMedia && !isCheckingMedia && (
            <div className="existing-media-info">
              {existingMedia.exists ? (
                <div className="media-summary">
                  <p className="media-count">
                    📱 {existingMedia.mediaCount} {t('mediaFilesAlreadyUploaded')}
                  </p>
                  <div className="media-preview">
                    {existingMedia.media.slice(0, 3).map((file, index) => (
                      <div key={index} className="media-item-preview">
                        {file.type === 'image' && <span>🖼️</span>}
                        {file.type === 'video' && <span>🎥</span>}
                        {file.type === 'audio' && <span>🎵</span>}
                        <span className="filename">{file.filename}</span>
                      </div>
                    ))}
                    {existingMedia.mediaCount > 3 && (
                      <p className="more-files">... and {existingMedia.mediaCount - 3} more</p>
                    )}
                  </div>
                  <p className="media-note">
                    {t('newMediaWillBeAdded')}
                  </p>
                </div>
              ) : (
                <div className="media-summary">
                  <p className="media-count">
                    📱 {t('noMediaUploadedYet')}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <button className="close-icon" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {!uploadType && (
          <div className="upload-options">
            <div className="option-card" onClick={() => handleUploadTypeChange('file')}>
              <div className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <div className="option-content">
                <h3>{t('uploadFile')}</h3>
                <p>{t('selectAudioVideoImage')}</p>
              </div>
              <div className="option-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
            </div>

            <div className="option-card" onClick={() => handleUploadTypeChange('audio')}>
              <div className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v14a4 4 0 0 0 4-4V5a4 4 0 0 0-8 0v6a4 4 0 0 0 4 4z"></path>
                  <line x1="19" y1="10" x2="19" y2="14"></line>
                  <line x1="5" y1="10" x2="5" y2="14"></line>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </div>
              <div className="option-content">
                <h3>{t('recordAudio')}</h3>
                <p>{t('recordVoiceMessages')}</p>
              </div>
              <div className="option-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
            </div>

            <div className="option-card" onClick={() => handleUploadTypeChange('video')}>
              <div className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23,7 16,12 23,17 23,7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <div className="option-content">
                <h3>{t('recordVideo')}</h3>
                <p>{t('recordVideoMessages')}</p>
              </div>
              <div className="option-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        )}

        {uploadType === 'file' && (
          <div className="file-upload-section">
            <div className="upload-area">
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3>{t('chooseYourFiles')}</h3>
              <p>{t('selectAudioVideoImageFiles')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button 
                className="upload-button"
                onClick={() => fileInputRef.current.click()}
              >
                {t('browseFiles')}
              </button>
            </div>
          </div>
        )}

        {uploadType === 'audio' && (
          <div className="recording-section">
            {!isRecording && !mediaBlob && (
              <div className="recording-setup">
                <div className="recording-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v14a4 4 0 0 0 4-4V5a4 4 0 0 0-8 0v6a4 4 0 0 0 4 4z"></path>
                    <line x1="19" y1="10" x2="19" y2="14"></line>
                    <line x1="5" y1="10" x2="5" y2="14"></line>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </div>
                <h3>{t('audioRecording')}</h3>
                <p>{t('clickToStartRecording')}</p>
                <button 
                  className="record-button"
                  onClick={startAudioRecording}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  {t('startRecording')}
                </button>
              </div>
            )}
            
            {isRecording && (
              <div className="recording-active">
                <div className="recording-indicator">
                  <div className="pulse-dot"></div>
                  <h3>{t('recordingAudio')}</h3>
                  <p>{t('speakClearly')}</p>
                </div>
                <button 
                  className="stop-button"
                  onClick={stopRecording}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12"></rect>
                  </svg>
                  {t('stopRecording')}
                </button>
              </div>
            )}
            
            {mediaBlob && !isRecording && (
              <div className="recording-preview">
                <div className="preview-header">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
                    <polygon points="9,11 12,14 15,11"></polygon>
                    <line x1="12" y1="14" x2="12" y2="20"></line>
                  </svg>
                  <h3>{t('audioRecordedSuccessfully')}</h3>
                  <p>{t('listenAndSave')}</p>
                </div>
                <div className="audio-player">
                  <audio controls src={URL.createObjectURL(mediaBlob)} />
                </div>
                <div className="action-buttons">
                  <button 
                    className="save-button"
                    onClick={handleSaveRecording}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17,21 17,13 7,13 7,21"></polyline>
                      <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    {t('saveRecording')}
                  </button>
                  <button 
                    className="retry-button"
                    onClick={() => {
                      setMediaBlob(null);
                      setUploadType(null);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1,4 1,10 7,10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    {t('recordAgain')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {uploadType === 'video' && (
          <div className="recording-section">
            {isRecording && (
              <div className="recording-active">
                <div className="recording-indicator">
                  <div className="pulse-dot"></div>
                  <h3>{t('recordingVideo')}</h3>
                  <p>{t('cameraActive')}</p>
                </div>
                <div className="video-preview">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    playsInline
                  />
                </div>
                <button 
                  className="stop-button"
                  onClick={stopRecording}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12"></rect>
                  </svg>
                  {t('stopRecording')}
                </button>
              </div>
            )}
            
            {mediaBlob && !isRecording && (
              <div className="recording-preview">
                <div className="preview-header">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
                    <polygon points="9,11 12,14 15,11"></polygon>
                    <line x1="12" y1="14" x2="12" y2="20"></line>
                  </svg>
                  <h3>{t('videoRecordedSuccessfully')}</h3>
                  <p>{t('watchAndSave')}</p>
                </div>
                <div className="video-player">
                  <video 
                    controls 
                    src={URL.createObjectURL(mediaBlob)}
                  />
                </div>
                <div className="action-buttons">
                  <button 
                    className="save-button"
                    onClick={handleSaveRecording}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17,21 17,13 7,13 7,21"></polyline>
                      <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    {t('saveRecording')}
                  </button>
                  <button 
                    className="retry-button"
                    onClick={() => {
                      setMediaBlob(null);
                      setUploadType(null);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1,4 1,10 7,10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    {t('recordAgain')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <h3>{t('uploadingMedia')}</h3>
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button 
            className="cancel-button"
            onClick={() => {
              if (isRecording) {
                stopRecording();
              }
              setUploadType(null);
              setMediaBlob(null);
              onClose();
            }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadModal; 