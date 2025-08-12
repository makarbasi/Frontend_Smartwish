import React, { useEffect, useRef } from "react";
import { PageFlip } from "page-flip";
import "../styles/SharableFlipbook.css";

const SharableFlipbook = ({ pages }) => {
  const bookContainerRef = useRef(null);
  const pageFlipInstance = useRef(null);

  useEffect(() => {
    function getResponsiveDims() {
      const width = bookContainerRef.current?.offsetWidth || 220;
      const height = Math.round(width * 1.4); // portrait ratio
      return { width, height };
    }

    if (bookContainerRef.current) {
      const { width, height } = getResponsiveDims();
      pageFlipInstance.current = new PageFlip(bookContainerRef.current, {
        width,
        height,
        size: "stretch",
        minWidth: 120,
        maxWidth: 800,
        minHeight: 120,
        maxHeight: 1800,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
      });

      pageFlipInstance.current.loadFromHTML(document.querySelectorAll(".sharable-page"));
    }

    return () => {
      if (pageFlipInstance.current && typeof pageFlipInstance.current.destroy === "function") {
        pageFlipInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="sharable-container-flip">
      <div className="sharable-flipbook" id="sharable-flipbook">
        <div ref={bookContainerRef}>
          {pages.map((page, index) => {
            const imageUrl = page.imageUrl || page.image;
            return (
              <div key={index} className="sharable-page">
                <div className="sharable-page-content">
                  <div
                    className="sharable-page-image"
                    style={{  
                      backgroundImage: `url(${imageUrl})`,
                      width: '100%',
                      height: '100%'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharableFlipbook; 