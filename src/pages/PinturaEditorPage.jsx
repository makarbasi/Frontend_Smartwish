import React, { useState, useCallback, useEffect } from 'react';
import { PinturaEditor } from '@pqina/react-pintura';
import '@pqina/pintura/pintura.css';
import '../styles/PinturaEditorPage.css';
import { useLanguage } from '../hooks/LanguageContext.jsx';

import {
  // editor
  createDefaultImageReader,
  createDefaultImageWriter,
  createDefaultShapePreprocessor,

  // plugins
  setPlugins,
  plugin_crop,
  plugin_finetune,
  plugin_finetune_defaults,
  plugin_filter,
  plugin_filter_defaults,
  plugin_annotate,
  markup_editor_defaults,
} from '@pqina/pintura';

import {
  LocaleCore,
  LocaleCrop,
  LocaleFinetune,
  LocaleFilter,
  LocaleAnnotate,
  LocaleMarkupEditor,
} from '@pqina/pintura/locale/en_GB';

setPlugins(plugin_crop, plugin_finetune, plugin_filter, plugin_annotate);

const editorDefaults = {
  utils: ["crop", "finetune", "filter", "annotate"],
  imageReader: createDefaultImageReader(),
  imageWriter: createDefaultImageWriter(),
  shapePreprocessor: createDefaultShapePreprocessor(),
  ...plugin_finetune_defaults,
  ...plugin_filter_defaults,
  ...markup_editor_defaults,
  locale: {
    ...LocaleCore,
    ...LocaleCrop,
    ...LocaleFinetune,
    ...LocaleFilter,
    ...LocaleAnnotate,
    ...LocaleMarkupEditor,
  },
};

const PinturaEditorPage = ({ imageSrc, onSave, onClose }) => {
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState(null);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [editorError, setEditorError] = useState(null);

  useEffect(() => {
    if (imageSrc) {
      // Convert imageSrc to a file object if it's a data URL
      if (imageSrc.startsWith('data:')) {
        try {
          const byteString = atob(imageSrc.split(',')[1]);
          const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const file = new File([ab], 'image.jpg', { type: mimeString });
          setImageFile(file);
          setIsEditorLoaded(true);
        } catch (error) {
          console.error('Error converting image to file:', error);
          setEditorError('Failed to load image');
        }
      } else {
        // For URL-based images, just set the URL directly
        setImageFile(imageSrc);
        setIsEditorLoaded(true);
      }
    }
  }, [imageSrc]);

  const handleClose = useCallback(() => {
    setImageFile(null);
    setIsEditorLoaded(false);
    setEditorError(null);
    onClose();
  }, [onClose]);

  const handleSave = useCallback((result) => {
    console.log('Pintura save result:', result);
    if (onSave && result) {
      const imageToSave = URL.createObjectURL(result.dest);
      onSave(imageToSave);
    }
    handleClose();
  }, [onSave, handleClose]);

  if (!imageSrc) {
    return null;
  }

  return (
    <div className="pintura-page-container">
      {isEditorLoaded && !editorError ? (
        <div className="pintura-editor-container">
          <PinturaEditor
            {...editorDefaults}
            src={imageFile}
            onLoad={(e) => {
              console.log('Pintura editor loaded:', e);
              console.log('Editor element should now be visible');
            }}
            onProcess={handleSave}
          />
        </div>
              ) : null}
    </div>
  );
};

export default PinturaEditorPage;
