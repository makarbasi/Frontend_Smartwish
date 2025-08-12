import React, { useEffect, useRef, useState } from "react";
import { PageFlip } from "page-flip";
import "../styles/flipbook.css";

import ImageEditor from "./ImageEditor.jsx";
import EditorChoiceModal from "./EditorChoiceModal.jsx";
import PinturaEditorPage from "../pages/PinturaEditorPage.jsx";
import { useLanguage } from '../hooks/LanguageContext.jsx';

const FlipBook = ({ title, pages, editedPages = {}, onEditPageSave, mediaQRCode = '' }) => {
  const { t } = useLanguage();
  const bookContainerRef = useRef(null);
  const pageFlipInstance = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [showEditorChoice, setShowEditorChoice] = useState(false);
  const [showPinturaEditor, setShowPinturaEditor] = useState(false);
  

  useEffect(() => {
    if (bookContainerRef.current) {
      pageFlipInstance.current = new PageFlip(bookContainerRef.current, {
        width: 550,
        height: 850,
        size: "stretch",
        minWidth: 215,
        maxWidth: 1000,
        minHeight: 320,
        maxHeight: 1350,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
      });

      pageFlipInstance.current.loadFromHTML(document.querySelectorAll(".page"));

      const pageCurrentElement = document.querySelector(".page-current");

      pageFlipInstance.current.on("flip", (e) => {
        if (pageCurrentElement) {
          pageCurrentElement.innerText = e.data + 1;
        }
      });
    }

    return () => {
      if (pageFlipInstance.current && typeof pageFlipInstance.current.destroy === "function") {
        pageFlipInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // Lock scroll when modal is open
    if (isEditing || showPinturaEditor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = ""; // Ensure cleanup on unmount
    };
  }, [isEditing, showPinturaEditor]);

  const handleEditClick = (page, index) => {
    const updatedPage = {
      ...page,
      image: editedPages[index] || page.image, // 👈 Use edited image if exists
    };
    setCurrentPage({ page: updatedPage, index });
    setShowEditorChoice(true);
  };

  const handleSave = (updatedImage) => {
    currentPage.image = updatedImage;
    setIsEditing(false);
  };

  const handleChooseEditor = (editorType, imageSrc) => {
    if (editorType === 'original') {
      setIsEditing(true);
    } else if (editorType === 'pintura') {
      setShowPinturaEditor(true);
    }
  };

  return (
    <div className="container-flip">
      <div className="flipbook" id="flipbook">
        <div className="" ref={bookContainerRef}>
          {pages.map((page, index) => {
            const imageUrl = editedPages[index] || page.image;
            return (
            <div key={index} className="page">
              <div className="page-content">
                <div
                  className="page-image"
                  style={{  
                    backgroundImage: `url(${imageUrl})`,
                    width: '100%',
                    height: '100%'
                  }}
                ></div>
                <button
                  className="edit-icon"
                  onClick={() => handleEditClick(page, index)}
                >
                  ✎ {t('edit')}
                </button>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Popup for editing */}
      {isEditing && (
        <ImageEditor
          page={currentPage.page}
          onSave={(newImage) => {
           // handleSave();
            onEditPageSave(currentPage.index, newImage); // Save to parent
            setIsEditing(false);
            
          }}
         
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Editor choice modal */}
      {showEditorChoice && currentPage && (
        <EditorChoiceModal
          isOpen={showEditorChoice}
          onClose={() => setShowEditorChoice(false)}
          onChooseEditor={handleChooseEditor}
          imageSrc={currentPage.page.image}
        />
      )}

      {/* Pintura editor page */}
      {showPinturaEditor && currentPage && (
        <PinturaEditorPage
          imageSrc={currentPage.page.image}
          onSave={(newImage) => {
            onEditPageSave(currentPage.index, newImage);
            setShowPinturaEditor(false);
          }}
          onClose={() => setShowPinturaEditor(false)}
        />
      )}
    </div>
  );
};

export default FlipBook;
