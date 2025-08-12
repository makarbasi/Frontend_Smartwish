// Utility functions for generating card images and saving to cloud storage

/**
 * Generate card images from design data
 * @param {Object} designData - The design data containing pages and edited pages
 * @returns {Promise<string[]>} Array of base64 image data
 */
export const generateCardImages = async (designData) => {
  const images = [];
  const pages = designData.pages || [];
  const editedPages = designData.editedPages || {};

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let imageData;

    // Use edited image if available, otherwise use original
    if (editedPages[i]) {
      imageData = editedPages[i];
    } else {
      imageData = page.image;
    }

    // If it's a base64 image, use it directly
    if (imageData.startsWith('data:image')) {
      images.push(imageData);
    } else if (imageData.startsWith('blob:')) {
      // Handle blob URLs - convert to base64
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        const base64Data = await base64Promise;
        images.push(base64Data);
      } catch (error) {
        console.error(`Error converting blob URL to base64 for page ${i}:`, error);
        // Use original image as fallback
        images.push(page.image);
      }
    } else {
      // If it's a file path, convert it to base64
      try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        const base64Data = await base64Promise;
        images.push(base64Data);
      } catch (error) {
        console.error(`Error converting image ${i} to base64:`, error);
        // Use original image as fallback
        images.push(page.image);
      }
    }
  }

  return images;
};

/**
 * Save images to cloud storage
 * @param {string[]} images - Array of base64 image data
 * @param {string|number} userId - User ID
 * @param {string} designId - Design ID (optional)
 * @param {string[]} oldImageUrls - Old image URLs for cleanup (optional)
 * @returns {Promise<Object>} Result with cloud URLs and timestamp
 */
export const saveImagesToCloud = async (images, userId, designId = null, oldImageUrls = null) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/save-images-cloud`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      images,
      userId,
      designId: designId || Date.now().toString(),
      oldImageUrls
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save images to cloud');
  }

  const result = await response.json();
  return result;
};

/**
 * Convert image to base64
 * @param {string} imageUrl - Image URL or blob URL
 * @returns {Promise<string>} Base64 image data
 */
export const convertImageToBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Validate if an image is in base64 format
 * @param {string} imageData - Image data to validate
 * @returns {boolean} True if image is base64
 */
export const isBase64Image = (imageData) => {
  return imageData && imageData.startsWith('data:image');
};

/**
 * Validate if an image is a blob URL
 * @param {string} imageData - Image data to validate
 * @returns {boolean} True if image is a blob URL
 */
export const isBlobUrl = (imageData) => {
  return imageData && imageData.startsWith('blob:');
};
