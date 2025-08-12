# Theme Images Directory

This directory contains theme preview images for the ImageEditor carousel.

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Dimensions**: Recommended 320x240px (4:3 aspect ratio)
- **File Size**: Keep under 100KB for optimal loading
- **Quality**: High quality but web-optimized

## Current Theme Images

The following theme images are expected:

1. `disney.jpg` - Disney character style
2. `pencil-sketch.jpg` - Pencil sketch style
3. `anime.jpg` - Anime style
4. `pixar.jpg` - Pixar-style 3D
5. `watercolor.jpg` - Watercolor style
6. `oil-painting.jpg` - Oil painting style
7. `charcoal.jpg` - Charcoal drawing style
8. `line-art.jpg` - Line art style
9. `pop-art.jpg` - Pop art style
10. `stencil.jpg` - Stencil art style
11. `low-poly.jpg` - Low poly style

## Adding New Theme Images

1. Add your image file to this directory
2. Update the `themedCards` array in `frontend/src/components/ImageEditor.jsx`
3. Add the image path to the theme object:
   ```javascript
   {
     id: 'your-theme',
     theme: 'Your Theme',
     title: 'Your Theme',
     color: '#HEXCOLOR', // Fallback color
     image: '/images/themes/your-theme.jpg',
     prompt: 'Your theme description for AI generation'
   }
   ```

## Fallback Behavior

If an image fails to load, the system will fall back to the solid color specified in the `color` property.

## Generating Placeholder Images

Open `generate-placeholders.html` in your browser to create placeholder images for testing.

## Image Optimization Tips

- Use tools like TinyPNG or ImageOptim to compress images
- Consider using WebP format for better compression
- Ensure images look good at small sizes (80x60px display size)
- Use high contrast and clear visual elements
