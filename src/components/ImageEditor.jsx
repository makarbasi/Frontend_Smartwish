import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../styles/ImageEditor.css";
import { useLanguage } from '../hooks/LanguageContext.jsx';

// Utility function to get base URL based on environment
const getBaseUrl = () => {
  // Use VITE_API_URL if defined
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback to previous logic
  const isDevelopment = process.env.NODE_ENV === 'development' ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    return `${window.location.protocol}//${window.location.hostname}:${window.location.port || 5173}`;
  } else {
    // Check if we're on Render.com
    if (window.location.hostname.includes('onrender.com')) {
      return `${window.location.protocol}//${window.location.hostname}`;
    } else {
      return import.meta.env.VITE_PRODUCTION_URL || 'https://app.smartwish.us';
    }
  }
};

// Themed greeting card data
const themedCards = [
  {
    id: 'disney',
    theme: 'Disney',
    title: 'Disney Character',
    color: '#FF6B9D',
    image: '/images/themes/disney.jpg',
    prompt: 'change this image to a  whimsical Disney-style with vibrant colors, expressive features, and magical atmosphere'
  },
  {
    id: 'pencil-sketch',
    theme: 'Pencil Sketch',
    title: 'Pencil Sketch',
    color: '#8B8B8B',
    image: '/images/themes/pencil-sketch.jpg',
    prompt: 'change this image to a minimalist pencil sketch with fine lines, subtle shading, and elegant black-and-white composition'
  },
  {
    id: 'anime',
    theme: 'Anime',
    title: 'Anime Style',
    color: '#FF9F43',
    image: '/images/themes/anime.jpg',
    prompt: 'change this image to a Japanese anime-style illustration with bold colors, expressive eyes, and dynamic character design'
  },
  {
    id: 'pixar',
    theme: 'Pixar-style 3D',
    title: 'Pixar-style 3D',
    color: '#00D2D3',
    image: '/images/themes/pixar.jpg',
    prompt: 'change this image to a Pixar-style 3D character with realistic textures, expressive features, and warm lighting'
  },
  {
    id: 'watercolor',
    theme: 'Watercolor',
    title: 'Watercolor',
    color: '#54A0FF',
    image: '/images/themes/watercolor.jpg',
    prompt: 'change this image to a soft watercolor painting with flowing colors, gentle brush strokes, and dreamy atmosphere'
  },
  {
    id: 'oil-painting',
    theme: 'Oil Painting',
    title: 'Oil Painting',
    color: '#FF6348',
    image: '/images/themes/oil-painting.jpg',
    prompt: 'change this image to a textured oil painting with thick brush strokes, rich colors, and artistic depth'
  },
  {
    id: 'charcoal',
    theme: 'Charcoal',
    title: 'Charcoal Drawing',
    color: '#2C3E50',
    image: '/images/themes/charcoal.jpg',
    prompt: 'change this image to a moody charcoal drawing with dramatic shadows, bold contrasts, and artistic intensity'
  },
  {
    id: 'line-art',
    theme: 'Line Art',
    title: 'Line Art',
    color: '#000000',
    image: '/images/themes/line-art.jpg',
    prompt: 'change this image to a Clean line art with bold inked lines, minimal shading, and graphic design style'
  },
  {
    id: 'pop-art',
    theme: 'Pop Art',
    title: 'Pop Art',
    color: '#FF6B6B',
    image: '/images/themes/pop-art.jpg',
    prompt: 'change this image to a Bright pop art with high contrast colors, bold patterns, and Andy Warhol-inspired style'
  },
  {
    id: 'stencil',
    theme: 'Stencil',
    title: 'Stencil Art',
    color: '#5F27CD',
    image: '/images/themes/stencil.jpg',
    prompt: 'change this image to a Street art stencil design with sharp edges, minimalist colors, and urban graffiti style'
  },
  {
    id: 'low-poly',
    theme: 'Low Poly',
    title: 'Low Poly',
    color: '#00B894',
    image: '/images/themes/low-poly.jpg',
    prompt: 'change this image to a Low poly 3D design with geometric shapes, flat shading, and modern minimalist style'
  }
];

const ImageEditor = ({ page, onSave, onClose }) => {
  const { t } = useLanguage();
  const [editedImage, setEditedImage] = useState(page.image);
  const [loading, setLoading] = useState(false);
  const [brushSize] = useState(200); // Larger brush size for more visible effect
  const [showWebcam, setShowWebcam] = useState(false);
  const [prompt, setPrompt] = useState('');
  const promptRef = useRef(null);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const drawingCanvasRef = useRef(null); // Separate canvas for drawings
  const videoRef = useRef(null);
  const [erasing, setErasing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [geminiUploadImage, setGeminiUploadImage] = useState(null);
  const [attachedImageName, setAttachedImageName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  
  // Image editing tools state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [activeTool, setActiveTool] = useState(null);
  const [isEraseMode, setIsEraseMode] = useState(false);
  const [isBrushMode, setIsBrushMode] = useState(false);
  
  // Store original image for non-destructive editing
  const originalImageRef = useRef(null);
  const baseImageRef = useRef(null); // Store the base image (after filters but before drawings)

  // Text tools state
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState('Arial');
  const [isDrawingText, setIsDrawingText] = useState(false);
  const [isHandwritingMode, setIsHandwritingMode] = useState(false);
  const [handwritingPoints, setHandwritingPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Carousel state
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(window.innerWidth <= 480);
  const carouselTrackRef = useRef(null);

  // Function to handle themed card click - directly apply to Gemini
  const handleThemedCardClick = async (card) => {
    setSelectedTheme(card.id);

    try {
      // Directly apply the theme prompt using the same function as the Apply button
      await handleInpaint(card.prompt);

      // Clear the prompt after a delay (same as Apply button behavior)
      setTimeout(() => {
        setPrompt("");
      }, 5000);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  // Function to handle image load errors
  const handleImageError = (cardId) => {
    setImageLoadErrors(prev => new Set([...prev, cardId]));
  };

  // Function to get visible cards (responsive: 5 on big screens, 3 on small)
  const getVisibleCards = () => {
    let visibleCount = 5; // Default for large screens
    
    if (isVerySmallScreen) {
      visibleCount = 3; // Very small screens show 3 cards
    } else if (isSmallScreen) {
      visibleCount = 3; // Small screens show 3 cards
    }
    
    const totalCards = themedCards.length;
    const visibleCards = [];

    for (let i = 0; i < visibleCount; i++) {
      const index = (carouselPosition + i) % totalCards;
      visibleCards.push(themedCards[index]);
    }

    // Debug logging for mobile carousel
    if (isSmallScreen || isVerySmallScreen) {
      console.log('Carousel debug:', {
        screenWidth: window.innerWidth,
        isSmallScreen,
        isVerySmallScreen,
        visibleCount,
        carouselPosition,
        visibleCards: visibleCards.map(card => card.title)
      });
    }

    return visibleCards;
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsSmallScreen(width <= 768);
      setIsVerySmallScreen(width <= 480);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to scroll carousel (circular)
  const scrollCarousel = (direction) => {
    const totalCards = themedCards.length;

    if (direction === 'left') {
      setCarouselPosition(prev => {
        const newPos = prev - 1;
        return newPos < 0 ? totalCards - 1 : newPos;
      });
    } else {
      setCarouselPosition(prev => {
        const newPos = prev + 1;
        return newPos >= totalCards ? 0 : newPos;
      });
    }
  };

  // Draggable carousel functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX || e.touches?.[0]?.clientX || 0);
    setDragStartPosition(carouselPosition);
    setTouchStartTime(Date.now());
    setHasMoved(false);
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transition = 'none';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const diffX = dragStartX - currentX;
    const cardWidth = 95; // Width of each card (80px) + gap (15px)
    const threshold = cardWidth / 2;
    const totalCards = themedCards.length;

    // Mark as moved if there's significant movement
    if (Math.abs(diffX) > 5) {
      setHasMoved(true);
    }

    let newPosition = dragStartPosition;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Dragging left - move right (circular)
        newPosition = dragStartPosition + 1;
        if (newPosition >= totalCards) {
          newPosition = 0;
        }
      } else {
        // Dragging right - move left (circular)
        newPosition = dragStartPosition - 1;
        if (newPosition < 0) {
          newPosition = totalCards - 1;
        }
      }
    }

    setCarouselPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (carouselTrackRef.current) {
      carouselTrackRef.current.style.transition = 'transform 0.3s ease';
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    // Don't prevent default to allow clicks
    handleMouseDown(e);
  };

  const handleTouchMove = (e) => {
    // Only prevent default if we're actually dragging
    if (hasMoved) {
      e.preventDefault();
    }
    handleMouseMove(e);
  };

  const handleTouchEnd = (e) => {
    const touchDuration = Date.now() - touchStartTime;

    // If it was a quick tap without movement, allow the click to proceed
    if (!hasMoved && touchDuration < 300) {
      // Don't prevent default - let the click event fire
    } else {
      // It was a drag, prevent default
      e.preventDefault();
    }

    handleMouseUp();
  };

  // Add event listeners for drag functionality
  useEffect(() => {
    const track = carouselTrackRef.current;
    if (!track) return;

    track.addEventListener('mousedown', handleMouseDown);
    track.addEventListener('mousemove', handleMouseMove);
    track.addEventListener('mouseup', handleMouseUp);
    track.addEventListener('mouseleave', handleMouseUp);
    
    // Touch events
    track.addEventListener('touchstart', handleTouchStart, { passive: false });
    track.addEventListener('touchmove', handleTouchMove, { passive: false });
    track.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      track.removeEventListener('mousedown', handleMouseDown);
      track.removeEventListener('mousemove', handleMouseMove);
      track.removeEventListener('mouseup', handleMouseUp);
      track.removeEventListener('mouseleave', handleMouseUp);
      track.removeEventListener('touchstart', handleTouchStart);
      track.removeEventListener('touchmove', handleTouchMove);
      track.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartX, dragStartPosition, carouselPosition, hasMoved, touchStartTime]);

  useEffect(() => {
    if (editedImage && editedImage.startsWith("https://oaidalleapiprodscus.blob.core.windows.net")) {
      fetchImage(editedImage);
    }
  }, [editedImage]);

  useEffect(() => {
    if (editedImage && canvasRef.current && maskCanvasRef.current) {
      const loadImage = async () => {
        try {
          let imageUrl = editedImage;
          
          // If it's an external URL (not blob or data URL), use proxy to avoid CORS
          if (editedImage.startsWith('http') && !editedImage.startsWith('blob:') && !editedImage.startsWith('data:')) {
            console.log('Loading external image through proxy to avoid CORS:', editedImage);
            imageUrl = await fetchImage(editedImage);
            if (!imageUrl) {
              console.error('Failed to load image through proxy');
              return;
            }
          }
          
          const img = new Image();
          img.crossOrigin = 'anonymous'; // Try to enable CORS
          img.src = imageUrl;
          
          img.onload = () => {
            const canvas = canvasRef.current;
            const maskCanvas = maskCanvasRef.current;
            
            // Set canvas to target dimensions
            canvas.width = 2550;
            canvas.height = 3300;
            maskCanvas.width = 2550;
            maskCanvas.height = 3300;
            
            // Store the original image
            originalImageRef.current = img;
            
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // Draw the image to fit the canvas dimensions
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Store the base image (after initial load)
              baseImageRef.current = new Image();
              baseImageRef.current.src = canvas.toDataURL();
            }
            
            const maskCtx = maskCanvas.getContext("2d");
            if (maskCtx) {
              maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            }
          };
          
          img.onerror = (error) => {
            console.error('Error loading image:', error);
            // Fallback: try without proxy
            const fallbackImg = new Image();
            fallbackImg.crossOrigin = 'anonymous';
            fallbackImg.src = editedImage;
            fallbackImg.onload = () => {
              const canvas = canvasRef.current;
              const maskCanvas = maskCanvasRef.current;
              
              canvas.width = 2550;
              canvas.height = 3300;
              maskCanvas.width = 2550;
              maskCanvas.height = 3300;
              
              originalImageRef.current = fallbackImg;
              
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height);
                
                baseImageRef.current = new Image();
                baseImageRef.current.src = canvas.toDataURL();
              }
              
              const maskCtx = maskCanvas.getContext("2d");
              if (maskCtx) {
                maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
              }
            };
          };
        } catch (error) {
          console.error('Error in loadImage:', error);
        }
      };
      
      loadImage();
    }
  }, [editedImage]);

  // Voice input setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      recognitionRef.current = null;
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
  }, []);



  const startErasing = (e) => {
    if (!isBrushMode && !isEraseMode) {
      console.log('Start erasing conditions not met:', { isBrushMode, isEraseMode });
      return;
    }
    console.log('Starting to erase');
    setErasing(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Save context and initialize the eraser path
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopErasing = () => {
    setErasing(false);
    // Restore the context state
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.restore();
      }
    }
  };

  const erase = (e) => {
    if (!erasing || !canvasRef.current || (!isBrushMode && !isEraseMode)) {
      console.log('Erase conditions not met:', { erasing, hasCanvas: !!canvasRef.current, isBrushMode, isEraseMode });
      return;
    }
    console.log('Erasing at:', e.clientX, e.clientY);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Erase from the main canvas - this creates transparent areas
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Don't restore the base image immediately - let the transparency show
      // This allows us to see the erased areas for inpainting
    }
  };

  const convertCanvasToBlob = (canvas) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject("Failed to convert canvas to blob.");
    }, "image/png");
  });

  const saveImageToServer = async (imageUrl) => {
    try {
      // If it's a blob URL, convert it to base64 data URL
      let dataUrl = imageUrl;
      if (imageUrl.startsWith('blob:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      const response = await fetch(`${getBaseUrl()}/save-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: dataUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Image saved:", data.filePath);
      } else {
        console.error("Error saving image:", data.message);
      }
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleOpenAIInpaint = async (prompt) => {
    if (!canvasRef.current || !maskCanvasRef.current) return;

    setLoading(true);

    try {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      // Create the proper mask
      const maskCtx = maskCanvas.getContext("2d");
      const ctx = canvas.getContext("2d");

      if (maskCtx && ctx) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

        // Step 1: Draw the original image on the mask canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Use proxy for external images to avoid CORS
        let imageUrl = editedImage;
        if (editedImage.startsWith('http') && !editedImage.startsWith('blob:') && !editedImage.startsWith('data:')) {
          imageUrl = await fetchImage(editedImage);
          if (!imageUrl) {
            console.error('Failed to load image through proxy for mask');
            return;
          }
        }
        
        img.src = imageUrl;

        await new Promise((resolve) => {
          img.onload = () => {
            maskCtx.drawImage(img, 0, 0, maskCanvas.width, maskCanvas.height);

            // Step 2: Apply the mask (transparent outside erased areas)
            maskCtx.globalCompositeOperation = "destination-in";
            maskCtx.drawImage(canvas, 0, 0, maskCanvas.width, maskCanvas.height);

            resolve(null);
          };
          
          img.onerror = () => {
            console.error('Error loading image for mask, trying fallback');
            // Fallback: try original URL
            const fallbackImg = new Image();
            fallbackImg.crossOrigin = 'anonymous';
            fallbackImg.src = editedImage;
            fallbackImg.onload = () => {
              maskCtx.drawImage(fallbackImg, 0, 0, maskCanvas.width, maskCanvas.height);
              maskCtx.globalCompositeOperation = "destination-in";
              maskCtx.drawImage(canvas, 0, 0, maskCanvas.width, maskCanvas.height);
              resolve(null);
            };
          };
        });
      }

      const originalBlob = await convertCanvasToBlob(canvas);
      const maskBlob = await convertCanvasToBlob(maskCanvas);

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("image", originalBlob, "image.png");
      formData.append("mask", maskBlob, "mask.png");
      formData.append("n", "1");
      formData.append("size", `${canvas.width}x${canvas.height}`);

      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`, // Use environment variable
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data?.data?.[0]?.url) {
        // Fetch the updated image
        const updatedImageURL = data.data[0].url;

        // Fetch the updated image and set it to editedImage state
        fetchImage(updatedImageURL).then((objectURL) => {
          setEditedImage(objectURL);
        });
      } else {
        console.error(t('invalidApiResponse'), data.error);
        console.error(`${t('failedToFetchEditedImage')}`);
      }
    } catch (err) {
      console.error("Inpainting error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAIPromptOnly = async (prompt) => {
    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const blob = await convertCanvasToBlob(canvas);

      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('image', blob, 'image.png');

      const response = await fetch(`${getBaseUrl()}/openai-edit`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data?.url) {
        const edited = await fetchImage(data.url);
        setEditedImage(edited);
      } else {
        console.error('Failed:', data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeminiInpaint = async (prompt) => {
    setLoading(true);

    try {
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      
      // Create a mask from transparent areas (similar to OpenAI approach)
      if (maskCanvas) {
        const maskCtx = maskCanvas.getContext("2d");
        const ctx = canvas.getContext("2d");

        if (maskCtx && ctx) {
          maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

          // Draw the original image on the mask canvas
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          // Use proxy for external images to avoid CORS
          let imageUrl = editedImage;
          if (editedImage.startsWith('http') && !editedImage.startsWith('blob:') && !editedImage.startsWith('data:')) {
            imageUrl = await fetchImage(editedImage);
            if (!imageUrl) {
              console.error('Failed to load image through proxy for Gemini mask');
              return;
            }
          }
          
          img.src = imageUrl;
          
          await new Promise((resolve) => {
            img.onload = () => {
              // Draw the original image
              maskCtx.drawImage(img, 0, 0, maskCanvas.width, maskCanvas.height);
              
              // Apply the mask: keep only the areas that are NOT transparent in the current canvas
              maskCtx.globalCompositeOperation = "destination-in";
              maskCtx.drawImage(canvas, 0, 0, maskCanvas.width, maskCanvas.height);
              
              // Check if there are any transparent areas
              const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
              const hasTransparentAreas = imageData.data.some((value, index) => index % 4 === 3 && value < 255);
              console.log('Transparent areas detected:', hasTransparentAreas);
              
              resolve(null);
            };
            
            img.onerror = () => {
              console.error('Error loading image for Gemini mask, trying fallback');
              // Fallback: try original URL
              const fallbackImg = new Image();
              fallbackImg.crossOrigin = 'anonymous';
              fallbackImg.src = editedImage;
              fallbackImg.onload = () => {
                maskCtx.drawImage(fallbackImg, 0, 0, maskCanvas.width, maskCanvas.height);
                maskCtx.globalCompositeOperation = "destination-in";
                maskCtx.drawImage(canvas, 0, 0, maskCanvas.width, maskCanvas.height);
                
                const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
                const hasTransparentAreas = imageData.data.some((value, index) => index % 4 === 3 && value < 255);
                console.log('Transparent areas detected (fallback):', hasTransparentAreas);
                
                resolve(null);
              };
            };
          });
        }
      }

      const originalBlob = await convertCanvasToBlob(canvas);
      const maskBlob = maskCanvas ? await convertCanvasToBlob(maskCanvas) : null;
      
      console.log('Mask creation:', {
        hasMaskCanvas: !!maskCanvas,
        hasMaskBlob: !!maskBlob,
        maskBlobSize: maskBlob ? maskBlob.size : 0
      });

      // Create an enhanced prompt that includes mask information
      let enhancedPrompt = prompt;
      
      // Analyze the prompt to provide more specific instructions
      const promptLower = prompt.toLowerCase();
      let specificInstructions = "";
      
      if (promptLower.includes('dog') || promptLower.includes('cat') || promptLower.includes('animal')) {
        specificInstructions = "ANIMAL INPAINTING: Ensure the animal looks natural and fits the scene's lighting and perspective.";
      } else if (promptLower.includes('person') || promptLower.includes('man') || promptLower.includes('woman') || promptLower.includes('people')) {
        specificInstructions = "PERSON INPAINTING: Ensure the person looks natural, matches the scene's lighting, and has appropriate clothing for the context.";
      } else if (promptLower.includes('car') || promptLower.includes('vehicle') || promptLower.includes('bike')) {
        specificInstructions = "VEHICLE INPAINTING: Ensure the vehicle fits the scene's perspective and lighting conditions.";
      } else if (promptLower.includes('tree') || promptLower.includes('plant') || promptLower.includes('flower')) {
        specificInstructions = "NATURE INPAINTING: Ensure the natural elements blend seamlessly with the environment.";
      } else if (promptLower.includes('building') || promptLower.includes('house') || promptLower.includes('structure')) {
        specificInstructions = "ARCHITECTURE INPAINTING: Ensure the structure follows proper perspective and architectural principles.";
      } else {
        specificInstructions = "GENERAL INPAINTING: Ensure the new content blends naturally with the existing scene.";
      }

      if (maskBlob) {
        enhancedPrompt = `🎨 INPAINTING TASK - PRECISE AREA FILLING

ORIGINAL IMAGE: The first image shows the complete scene with transparent areas
MASK IMAGE: The second image shows the preserved areas (where you should NOT make changes)

TASK: Fill ONLY the transparent/erased areas with: "${prompt}"

CRITICAL RULES:
✅ FILL: Only the transparent/erased areas (areas not shown in the mask)
❌ PRESERVE: All areas shown in the mask image exactly as they are
🎯 MATCH: Style, lighting, perspective, and quality of original image
🔍 ANALYZE: The mask shows preserved areas - fill everything else

${specificInstructions}

STEP-BY-STEP:
1. Look at the mask image - these areas should remain unchanged
2. Fill all other areas (transparent/erased) with: ${prompt}
3. Blend seamlessly with the preserved areas
4. Maintain original image quality and style
5. Do not modify any areas shown in the mask

RESULT: A complete image where transparent areas are filled, preserved areas unchanged.`;
      } else {
        // Fallback for when no mask is available (general image editing)
        enhancedPrompt = `🎨 IMAGE EDITING TASK

TASK: Modify the image to include: "${prompt}"

${specificInstructions}

INSTRUCTIONS:
- Integrate the new content naturally into the existing scene
- Maintain the original image's style, lighting, and quality
- Ensure the result looks cohesive and realistic
- Preserve the overall composition and atmosphere

RESULT: An enhanced image that includes the requested content while maintaining visual coherence.`;
      }

      const formData = new FormData();
      formData.append("prompt", enhancedPrompt);
      formData.append("image", originalBlob, "image.png");

      // Include mask as extra image if available
      if (maskBlob) {
        formData.append("extraImage", maskBlob, "mask.png");
      }

      if (geminiUploadImage) {
        formData.append("extraImage", geminiUploadImage, "extra.png"); // 👈 for face or reference image
      }

      const response = await fetch(`${getBaseUrl()}/gemini-inpaint`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data?.imageUrl) {
        const updatedImage = await fetchImage(data.imageUrl);
        setEditedImage(updatedImage);
      } else {
        console.error("Gemini API Error:", data);
        console.error("Gemini did not return an image.");
      }
    } catch (err) {
      console.error("Gemini error:", err);
      console.error("Error occurred during Gemini inpainting.");
    } finally {
      setLoading(false);
    }
  };

  const handleInpaint = async (promptText) => {
    if (!promptText) {
      console.log("Please enter a prompt.");
      return;
    }

    switch (selectedModel) {
      case "openai":
        await handleOpenAIInpaint(promptText);
        break;
      case "openai-prompt":
        await handleOpenAIPromptOnly(promptText);
        break;
      case "gemini":
        await handleGeminiInpaint(promptText); // ✅ Now this works
        break;
      default:
        console.log("Please select a valid model.");
    }
  };

  const fetchImage = async (imageUrl) => {
    const encodedUrl = encodeURIComponent(imageUrl); // Encode URL properly
    const proxyUrl = `${getBaseUrl()}/proxy?url=${encodedUrl}`;

    console.log("Proxy URL:", proxyUrl); // Debugging line

    try {
      const response = await fetch(proxyUrl, {
        cache: "no-store" // Force fresh download
      });

      if (!response.ok) {
        throw new Error(`Proxy fetch failed: ${response.status}`);
      }

      const newBlob = await response.blob();
      const uniqueObjectURL = URL.createObjectURL(newBlob);

      return uniqueObjectURL;
    } catch (error) {
      console.error("Error fetching through proxy:", error.message);
      return null;
    }
  };

  const handleSave = async () => {
    if (!canvasRef.current) {
      console.error("Canvas not available");
      return;
    }

    try {
      // Get the current canvas content with all edits applied
      const canvas = canvasRef.current;
      const blob = await convertCanvasToBlob(canvas);
      
      // Convert blob to data URL for the onSave callback
      const dataUrl = URL.createObjectURL(blob);
      onSave(dataUrl);
      
      // Save the edited image to server
      await saveImageToServer(dataUrl);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const resizeImageToTargetRatio = (imageUrl) => {
    console.log('resizeImageToTargetRatio called with:', imageUrl.substring(0, 50) + '...');
    return new Promise(async (resolve, reject) => {
      try {
        let processedImageUrl = imageUrl;
        
        // If it's an external URL, use proxy to avoid CORS
        if (imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
          console.log('Resizing external image through proxy to avoid CORS:', imageUrl);
          processedImageUrl = await fetchImage(imageUrl);
          if (!processedImageUrl) {
            console.error('Failed to load image through proxy for resizing');
            reject(new Error('Failed to load image through proxy'));
            return;
          }
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
          const targetWidth = 2550;
          const targetHeight = 3300;
          
          // Create canvas with target dimensions
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          
          console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);
          
          // Stretch the image to fill the entire canvas (may distort aspect ratio)
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // Convert to data URL
          const resizedImageUrl = canvas.toDataURL('image/png');
          console.log('Image resized successfully, new data URL length:', resizedImageUrl.length);
          resolve(resizedImageUrl);
        };
        img.onerror = (error) => {
          console.error('Error loading image for resizing:', error);
          reject(error);
        };
        img.src = processedImageUrl;
      } catch (error) {
        console.error('Error in resizeImageToTargetRatio:', error);
        reject(error);
      }
    });
  };

  const handleUserImageUpload = async (e) => {
    console.log('handleUserImageUpload called', e);
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      const reader = new FileReader();
      reader.onload = async () => {
        console.log('File read successfully');
        const originalImageUrl = reader.result;
        try {
          // Resize the image to target ratio
          const resizedImageUrl = await resizeImageToTargetRatio(originalImageUrl);
          console.log('Image resized successfully');
          setEditedImage(resizedImageUrl);
        } catch (error) {
          console.error('Error resizing image:', error);
          alert('Error processing the image. Please try again.');
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the selected file. Please try again.');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const openWebcam = async () => {
    setShowWebcam(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const captureFromWebcam = () => {
    if (!videoRef.current) return;

    const targetWidth = 2550;
    const targetHeight = 3300;

    const video = videoRef.current;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Calculate scale to fill the target completely (may crop some parts)
    const scale = Math.max(targetWidth / vw, targetHeight / vh);
    const scaledWidth = vw * scale;
    const scaledHeight = vh * scale;

    // Calculate top-left crop origin to center the image
    const sx = (scaledWidth - targetWidth) / 2;
    const sy = (scaledHeight - targetHeight) / 2;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    // Now crop to final size from the center
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const finalCtx = finalCanvas.getContext("2d");
    finalCtx.drawImage(
      tempCanvas,
      sx, sy, targetWidth, targetHeight,
      0, 0, targetWidth, targetHeight
    );

    const dataUrl = finalCanvas.toDataURL("image/png");
    setEditedImage(dataUrl);
    setShowWebcam(false);

    const stream = video.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      console.log('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    setIsListening(true);
    recognitionRef.current.start();
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      if (promptRef.current) {
        promptRef.current.value = transcript;
      }
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  };

  // Image editing functions
  const applyImageFilters = () => {
    if (!canvasRef.current || !originalImageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const originalImg = originalImageRef.current;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Draw the original image with filters applied
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    
    // Reset filter to avoid affecting other operations
    ctx.filter = 'none';
    
    // Update the base image with the filtered version
    baseImageRef.current = new Image();
    baseImageRef.current.src = canvas.toDataURL();
  };

  const resetImage = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    
    // Reload the original image
    if (originalImageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height);
        
        // Update the base image to the original state
        baseImageRef.current = new Image();
        baseImageRef.current.src = canvas.toDataURL();
      }
    }
  };

  // Text functions
  const addTextToCanvas = (text, x, y) => {
    if (!canvasRef.current || !text) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Save the current context state
    ctx.save();
    
    // Ensure we're drawing on top of everything
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${textSize}px ${textFont}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
    
    // Restore the context state
    ctx.restore();
  };

  const handleCanvasClick = (e) => {
    if (!isDrawingText || !textInput) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    addTextToCanvas(textInput, x, y);
    setIsDrawingText(false);
    setTextInput('');
  };

  const handleTextMicClick = () => {
    if (!recognitionRef.current) {
      console.log('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    recognitionRef.current.start();
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTextInput(transcript);
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  };

  // Handwriting functions
  const startHandwriting = (e) => {
    if (!isHandwritingMode) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Initialize drawing context
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = textColor;
    ctx.lineWidth = textSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    setHandwritingPoints([[x, y]]);
  };

  const drawHandwriting = (e) => {
    if (!isDrawing || !isHandwritingMode) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setHandwritingPoints(prev => [...prev, [x, y]]);
  };

  const stopHandwriting = () => {
    setIsDrawing(false);
    setHandwritingPoints([]);
    // Restore the context state
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.restore();
      }
    }
  };

  // Apply filters when values change
  useEffect(() => {
    if (canvasRef.current && originalImageRef.current && (brightness !== 100 || contrast !== 100 || saturation !== 100)) {
      applyImageFilters();
    }
  }, [brightness, contrast, saturation]);

  // Toast notification function
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };



  // Handle click outside to close tool controls
  useEffect(() => {
    const handleClickOutside = (event) => {
      const ribbon = event.target.closest('.editing-ribbon');
      if (!ribbon && activeTool) {
        setActiveTool(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeTool]);

  // Add touch event listeners with passive: false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Touch start detected', { isBrushMode, isEraseMode, isHandwritingMode });
      
      // Add visual feedback for touch detection
      if (canvas) {
        canvas.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
        setTimeout(() => {
          canvas.style.backgroundColor = '';
        }, 200);
      }
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      
      console.log('Touch coordinates:', { 
        clientX: touch.clientX, 
        clientY: touch.clientY, 
        rectLeft: rect.left, 
        rectTop: rect.top,
        scaleX, 
        scaleY, 
        canvasWidth: canvas.width, 
        canvasHeight: canvas.height,
        rectWidth: rect.width, 
        rectHeight: rect.height,
        calculatedX: x, 
        calculatedY: y 
      });
      
      if (isHandwritingMode) {
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        startHandwriting(mouseEvent);
      } else if (isEraseMode || isBrushMode) {
        console.log('Starting brush/erase on touch');
        // Direct canvas manipulation for better mobile performance
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = brushSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y);
          setErasing(true);
          console.log('Brush context set up:', { brushSize, x, y });
        } else {
          console.error('Failed to get canvas context');
        }
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isHandwritingMode) {
        stopHandwriting();
      } else if (isEraseMode || isBrushMode) {
        setErasing(false);
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.restore();
          }
        }
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      
      if (isHandwritingMode) {
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        drawHandwriting(mouseEvent);
      } else if ((isEraseMode || isBrushMode) && erasing) {
        console.log('Drawing brush stroke:', { x, y, erasing });
        // Direct canvas manipulation for better mobile performance
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.lineTo(x, y);
          ctx.stroke();
          console.log('Brush stroke drawn');
        } else {
          console.error('Failed to get canvas context for drawing');
        }
      }
    };

    // Add event listeners with passive: false
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isHandwritingMode, isEraseMode, isBrushMode, erasing, brushSize]);

  return ReactDOM.createPortal(
    <div className={`editor-modal`}>
      <div className={`editor-content`}>
        <div className="selection-options">
          <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}  style={{ display: 'none' }}>
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI (with brush)</option>
            <option value="openai-prompt">OpenAI (prompt only)</option>
          </select>
        </div>

        <div className="editor-body">
          <div className="editor-canvas">
            {showWebcam ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                width: '100%',
                height: '100%'
              }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: 'auto',
                    aspectRatio: '2550/3300',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    backgroundColor: '#000',
                    marginBottom: '15px'
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={captureFromWebcam} className="webcam-capture-button">
                    {t('capture')}
                  </button>
                  <button 
                    onClick={() => {
                      setShowWebcam(false);
                      const stream = videoRef.current?.srcObject;
                      if (stream) stream.getTracks().forEach(track => track.stop());
                    }} 
                    className="webcam-capture-button"
                    style={{ backgroundColor: '#6c757d' }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <canvas 
                  ref={canvasRef} 
                  className={`canvas ${isBrushMode || isEraseMode ? 'brush-active' : ''}`}
                  onClick={(e) => {
                    if (isDrawingText && textInput) {
                      handleCanvasClick(e);
                    }
                  }}
                  onMouseDown={(e) => {
                    if (isHandwritingMode) {
                      startHandwriting(e);
                    } else if (isEraseMode || isBrushMode) {
                      startErasing(e);
                    }
                  }} 
                  onMouseUp={(e) => {
                    if (isHandwritingMode) {
                      stopHandwriting();
                    } else if (isEraseMode || isBrushMode) {
                      stopErasing();
                    }
                  }} 
                  onMouseMove={(e) => {
                    if (isHandwritingMode) {
                      drawHandwriting(e);
                    } else if (isEraseMode || isBrushMode) {
                      erase(e);
                    }
                  }}

                />
                

                
                <canvas ref={maskCanvasRef} className="canvas hidden" />
              </>
            )}
          </div>

          {/* Vertical Editing Ribbon */}
          <div className="editing-ribbon">
            <div className="ribbon-icons">
              <button 
                className={`ribbon-icon ${activeTool === 'brightness' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTool(activeTool === 'brightness' ? null : 'brightness');
                  setIsBrushMode(false);
                  setIsEraseMode(false);
                  setIsHandwritingMode(false);
                }}
                title="Brightness"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </button>
              
              <button 
                className={`ribbon-icon ${activeTool === 'contrast' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTool(activeTool === 'contrast' ? null : 'contrast');
                  setIsBrushMode(false);
                  setIsEraseMode(false);
                  setIsHandwritingMode(false);
                }}
                title="Contrast"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </button>
              
              <button 
                className={`ribbon-icon ${activeTool === 'saturation' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTool(activeTool === 'saturation' ? null : 'saturation');
                  setIsBrushMode(false);
                  setIsEraseMode(false);
                  setIsHandwritingMode(false);
                }}
                title="Saturation"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a10 10 0 0 1 0 20"/>
                  <path d="M12 2a10 10 0 0 0 0 20"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </button>
              
              <button 
                className={`ribbon-icon ${isBrushMode ? 'active' : ''}`}
                onClick={() => {
                  const wasActive = isBrushMode;
                  setIsBrushMode(!isBrushMode);
                  setIsEraseMode(false);
                  setIsHandwritingMode(false);
                  setActiveTool(null);
                  if (!wasActive) {
                    showToast('Brush mode active - Click and drag to erase areas', 'brush');
                    console.log('Brush mode activated');
                  } else {
                    console.log('Brush mode deactivated');
                  }
                }}
                title="Brush"
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M27.555 8.42c-1.355 1.647-5.070 6.195-8.021 9.81l-3.747-3.804c3.389-3.016 7.584-6.744 9.1-8.079 2.697-2.377 5.062-3.791 5.576-3.213 0.322 0.32-0.533 2.396-2.908 5.286zM18.879 19.030c-1.143 1.399-2.127 2.604-2.729 3.343l-4.436-4.323c0.719-0.64 1.916-1.705 3.304-2.939l3.861 3.919zM15.489 23.183v-0.012c-2.575 9.88-14.018 4.2-14.018 4.2s4.801 0.605 4.801-3.873c0-4.341 4.412-4.733 4.683-4.753l4.543 4.427c0 0.001-0.009 0.011-0.009 0.011z"></path>
                </svg>
              </button>
              
              <button 
                className={`ribbon-icon ${isEraseMode ? 'active' : ''}`}
                onClick={() => {
                  const wasActive = isEraseMode;
                  setIsEraseMode(!isEraseMode);
                  setIsBrushMode(false);
                  setIsHandwritingMode(false);
                  setActiveTool(null);
                  if (!wasActive) {
                    showToast('Erase mode active - Click and drag to erase areas', 'erase');
                  }
                }}
                title="Erase"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <path d="M10 11v6"/>
                  <path d="M14 11v6"/>
                </svg>
              </button>
              
              <button 
                className={`ribbon-icon ${activeTool === 'text' ? 'active' : ''}`}
                onClick={() => {
                  const wasActive = activeTool === 'text';
                  setActiveTool(activeTool === 'text' ? null : 'text');
                  setIsBrushMode(false);
                  setIsEraseMode(false);
                  setIsHandwritingMode(false);
                  if (!wasActive) {
                    showToast('Text mode active - Enter text and click to place', 'text');
                  }
                }}
                title="Add Text"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 10H3"/>
                  <path d="M21 6H3"/>
                  <path d="M21 14H3"/>
                  <path d="M17 18H3"/>
                  <path d="M7 2v20"/>
                </svg>
              </button>
              
              <button 
                className={`ribbon-icon ${activeTool === 'handwriting' ? 'active' : ''}`}
                onClick={() => {
                  const wasActive = activeTool === 'handwriting';
                  if (activeTool === 'handwriting') {
                    setActiveTool(null);
                    setIsHandwritingMode(false);
                  } else {
                    setActiveTool('handwriting');
                    setIsHandwritingMode(true);
                    setIsEraseMode(false);
                    setIsBrushMode(false);
                  }
                  if (!wasActive) {
                    showToast('Handwriting mode active - Draw with your finger/stylus', 'handwriting');
                  }
                }}
                title="Handwriting"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </button>
              
              <button 
                className="ribbon-icon"
                onClick={() => {
                  resetImage();
                  setIsBrushMode(false);
                  setIsEraseMode(false);
                  setIsHandwritingMode(false);
                  setActiveTool(null);
                }}
                title="Reset"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
              </button>
            </div>
            
            {/* Tool Controls Panel */}
            {activeTool && (
              <div className="tool-controls">
                {activeTool === 'brightness' && (
                  <div className="control-panel">
                    <h4>Brightness</h4>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="control-slider"
                    />
                    <span className="control-value">{brightness}%</span>
                  </div>
                )}
                
                {activeTool === 'contrast' && (
                  <div className="control-panel">
                    <h4>Contrast</h4>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="control-slider"
                    />
                    <span className="control-value">{contrast}%</span>
                  </div>
                )}
                
                {activeTool === 'saturation' && (
                  <div className="control-panel">
                    <h4>Saturation</h4>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="control-slider"
                    />
                    <span className="control-value">{saturation}%</span>
                  </div>
                )}
                
                {activeTool === 'text' && (
                  <div className="control-panel">
                    <h4>Add Text</h4>
                    <div className="text-controls">
                      <input
                        type="text"
                        placeholder="Enter text..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="text-input"
                      />
                      <button 
                        onClick={handleTextMicClick}
                        className="text-mic-btn"
                        title="Voice input"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/>
                          <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => setIsDrawingText(true)}
                        className="add-text-btn"
                        disabled={!textInput}
                      >
                        Add Text
                      </button>
                    </div>
                    <div className="text-options">
                      <div className="option-group">
                        <label>Color:</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="color-picker"
                        />
                      </div>
                      <div className="option-group">
                        <label>Size:</label>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={textSize}
                          onChange={(e) => setTextSize(parseInt(e.target.value))}
                          className="control-slider"
                        />
                        <span className="control-value">{textSize}px</span>
                      </div>
                      <div className="option-group">
                        <label>Font:</label>
                        <select
                          value={textFont}
                          onChange={(e) => setTextFont(e.target.value)}
                          className="font-select"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTool === 'handwriting' && (
                  <div className="control-panel">
                    <h4>Handwriting</h4>
                    <div className="handwriting-controls">
                      <button 
                        onClick={() => {
                          if (isHandwritingMode) {
                            setIsHandwritingMode(false);
                            setActiveTool(null);
                          } else {
                            setIsHandwritingMode(true);
                            setActiveTool('handwriting');
                            setIsEraseMode(false);
                          }
                        }}
                        className={`handwriting-toggle ${isHandwritingMode ? 'active' : ''}`}
                      >
                        {isHandwritingMode ? 'Disable' : 'Enable'} Handwriting
                      </button>
                    </div>
                    <div className="handwriting-options">
                      <div className="option-group">
                        <label>Color:</label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="color-picker"
                        />
                      </div>
                      <div className="option-group">
                        <label>Thickness:</label>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={textSize}
                          onChange={(e) => setTextSize(parseInt(e.target.value))}
                          className="control-slider"
                        />
                        <span className="control-value">{textSize}px</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Themed Greeting Card Carousel */}
          <div className="themed-carousel-container">
            {/* Debug info for mobile */}
            {(isSmallScreen || isVerySmallScreen) && (
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '10px',
                fontSize: '10px',
                color: '#666',
                zIndex: 1000,
                background: 'rgba(255,255,255,0.8)',
                padding: '2px 4px',
                borderRadius: '2px'
              }}>
                {isVerySmallScreen ? 'XS' : 'S'} - {getVisibleCards().length} cards
              </div>
            )}
            <div className="themed-carousel">
              <div
                ref={carouselTrackRef}
                className="themed-carousel-track"
              >
                {getVisibleCards().map((card, index) => (
                  <div key={card.id} className="themed-card-container">
                    <div className="card-title-external">{card.title}</div>
                    <div
                      className={`themed-card ${selectedTheme === card.id ? 'selected' : ''}`}
                      onClick={() => handleThemedCardClick(card)}
                      style={{
                        backgroundImage: (card.image && !imageLoadErrors.has(card.id)) ? `url(${card.image})` : 'none',
                        backgroundColor: card.color,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      {/* Hidden image element to detect load errors */}
                      {card.image && !imageLoadErrors.has(card.id) && (
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ display: 'none' }}
                          onError={() => handleImageError(card.id)}
                          onLoad={() => {
                            // Remove from error set if it loads successfully
                            setImageLoadErrors(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(card.id);
                              return newSet;
                            });
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="editor-tools">
            <div className="prompt-div">
              <div className="tool-buttons">
                <button className="tool-icon-button" title={t('uploadImage')}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUserImageUpload}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <img 
                    src="/image-upload.svg" 
                    alt={t('uploadImage')} 
                    width="24" 
                    height="24"
                    style={{ filter: 'brightness(0) saturate(100%) invert(1)' }}
                  />
                </button>
                <button className="tool-icon-button" onClick={openWebcam} title={t('liveCamera')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </div>
              <div className="prompt-with-upload">
                {geminiUploadImage && (
                  <div className="attached-images">
                    <div className="attached-thumbnails">
                      <img src={URL.createObjectURL(geminiUploadImage)} alt="Attached" className="thumbnail" />
                    </div>
                  </div>
                )}
                <div className="prompt-input-container">
                  <input
                    className={`prompt-field ${geminiUploadImage ? "with-image" : ""}`}
                    type="text"
                    ref={promptRef}
                    placeholder={(isBrushMode || isEraseMode) ? "Describe what to add in the transparent areas..." : t('describeYourImage')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  {/* Microphone button positioned inside the input field */}
                  <button
                    type="button"
                    className={`mic-btn${isListening ? ' listening' : ''}`}
                    onClick={handleMicClick}
                    title={isListening ? t('listening') : t('voiceInput')}
                  >
                    <img 
                      src="/mic.svg" 
                      alt={t('voiceInput')} 
                      width="18" 
                      height="18"
                      style={{ 
                        filter: isListening 
                          ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(86deg) brightness(118%) contrast(119%)' 
                          : 'brightness(0) saturate(100%) invert(1)'
                      }}
                    />
                  </button>
                </div>
                <label className="image-upload-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path d="M4 5h13v7h2V5c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h8v-2H4V5z"/><path d="m8 11-3 4h11l-4-6-3 4z"/><path d="M19 14h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/></svg>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                    onChange={(e) => {
                      console.log('Gemini upload file selected:', e.target.files?.[0]);
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Gemini file details:', {
                          name: file.name,
                          size: file.size,
                          type: file.type
                        });
                        setGeminiUploadImage(file);
                        setAttachedImageName(file.name);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="inpainting-btn-container">
                <div className="tool-buttons">
                  <button className="tool-icon-button" title={t('uploadImage')}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUserImageUpload}
                      style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <img 
                      src="/image-upload.svg" 
                      alt={t('uploadImage')} 
                      width="24" 
                      height="24"
                      style={{ filter: 'brightness(0) saturate(100%) invert(1)' }}
                    />
                  </button>
                  <button className="tool-icon-button" onClick={openWebcam} title={t('liveCamera')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </button>
                </div>
                <button className="inpainting-btn" onClick={() =>{ handleInpaint(prompt); setTimeout(() => {
      setPrompt("");
    }, 5000);}} disabled={loading}>
                  {loading ? "Editing..." : t('apply')}
                </button>
                

                
                {/* Mobile Save and Cancel buttons */}
                <button onClick={handleSave} className="mobile-save-button">{t('save')}</button>
                <button onClick={onClose} className="mobile-cancel-button">{t('cancel')}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop footer - hidden on mobile */}
        <div className="editor-footer desktop-footer">
          <button onClick={handleSave} className="editor-save-button">{t('save')}</button>
          <button onClick={onClose} className="editor-cancel-button">{t('cancel')}</button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>,
    document.body
  );
};

export default ImageEditor;
