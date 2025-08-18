# Supabase Storage Structure for SmartWish

## Overview
This document defines the storage bucket structure for SmartWish published designs, optimized for scalability, performance, and organization.

## Storage Buckets

### 1. `smartwish-published` (Main Published Content)
**Purpose**: Store published design images with public access
**Access**: Public read, authenticated write
**CDN**: Enabled for global distribution

```
smartwish-published/
├── designs/
│   ├── {design-id}/
│   │   ├── pages/
│   │   │   ├── page_1.webp          # Main format (WebP for performance)
│   │   │   ├── page_1.png           # Fallback format
│   │   │   ├── page_1_thumb.webp    # Thumbnail (200x150)
│   │   │   ├── page_2.webp
│   │   │   ├── page_2.png
│   │   │   ├── page_2_thumb.webp
│   │   │   ├── page_3.webp
│   │   │   ├── page_3.png
│   │   │   ├── page_3_thumb.webp
│   │   │   ├── page_4.webp
│   │   │   ├── page_4.png
│   │   │   └── page_4_thumb.webp
│   │   ├── previews/
│   │   │   ├── cover.webp           # Design cover image
│   │   │   ├── cover.png            # Fallback
│   │   │   ├── grid.webp            # 2x2 grid preview
│   │   │   └── carousel.webp        # Horizontal carousel view
│   │   └── metadata.json            # Image metadata and processing info
```

### 2. `smartwish-drafts` (Private Draft Content)
**Purpose**: Store draft/private design images
**Access**: Private (RLS policies)

```
smartwish-drafts/
├── users/
│   ├── {user-id}/
│   │   ├── designs/
│   │   │   ├── {design-id}/
│   │   │   │   ├── page_1.png
│   │   │   │   ├── page_2.png
│   │   │   │   ├── page_3.png
│   │   │   │   └── page_4.png
│   │   │   └── temp/              # Temporary uploads
│   │   │       ├── {timestamp}_page_1.png
│   │   │       └── ...
│   │   └── profile/
│   │       └── avatar.webp
```

### 3. `smartwish-assets` (System Assets)
**Purpose**: Store system templates, categories, and UI assets
**Access**: Public read

```
smartwish-assets/
├── categories/
│   ├── birthday/
│   │   ├── cover.webp
│   │   └── icon.svg
│   ├── anniversary/
│   └── ...
├── templates/
│   ├── system/
│   │   ├── {template-id}/
│   │   │   ├── page_1.jpg
│   │   │   ├── page_2.jpg
│   │   │   ├── page_3.jpg
│   │   │   └── page_4.jpg
├── ui/
│   ├── icons/
│   ├── backgrounds/
│   └── patterns/
└── marketplace/
    ├── gift-cards/
    └── memberships/
```

## Storage Optimization Strategy

### Image Processing Pipeline
1. **Upload**: Original PNG/JPEG from user
2. **Processing**: 
   - Convert to WebP (85% quality) for main use
   - Keep PNG/JPEG as fallback
   - Generate thumbnails (200x150px)
   - Create preview compositions
3. **CDN**: Distribute via Supabase CDN
4. **Metadata**: Store processing info in database

### File Naming Convention
```
{timestamp}_{type}_{page}_{variant}.{ext}

Examples:
- 1703123456789_page_1_main.webp
- 1703123456789_page_1_thumb.webp
- 1703123456789_preview_cover.webp
- 1703123456789_preview_grid.webp
```

### Size Limits & Quotas
- **Max file size**: 5MB per image
- **Max images per design**: 20 (4 pages + variants)
- **Total storage per user**: 1GB (can be increased)
- **CDN bandwidth**: Unlimited via Supabase Pro

## Implementation Details

### 1. Enhanced Storage Service

```typescript
// backend/src/storage/enhanced-storage.service.ts
export class EnhancedStorageService {
  
  async publishDesign(designId: string, images: string[]): Promise<PublishedDesignUrls> {
    // 1. Create design folder structure
    // 2. Process and upload images in multiple formats
    // 3. Generate previews and thumbnails
    // 4. Update database with URLs
    // 5. Trigger CDN distribution
  }
  
  async createImageVariants(imageData: string): Promise<ImageVariants> {
    // Generate WebP, PNG, thumbnail versions
  }
  
  async generatePreviews(images: string[]): Promise<PreviewUrls> {
    // Create cover, grid, carousel previews
  }
}
```

### 2. Database Integration

```sql
-- Store all image URLs and metadata
INSERT INTO sw_design_images (design_id, page_number, image_type, storage_path, public_url, cdn_url, webp_url, thumbnail_url, file_size, dimensions)
VALUES 
  (design_id, 1, 'page', 'designs/{id}/pages/page_1.webp', 'https://...', 'https://cdn...', 'https://...webp', 'https://...thumb', 245678, '{"width": 800, "height": 600}'),
  (design_id, 1, 'thumbnail', 'designs/{id}/pages/page_1_thumb.webp', '...', '...', '...', '...', 15678, '{"width": 200, "height": 150}');
```

### 3. Frontend Optimization

```javascript
// Progressive image loading
const ImageComponent = ({ design, page }) => {
  return (
    <picture>
      {/* Modern browsers - WebP */}
      <source srcSet={design.images[page].webp_url} type="image/webp" />
      {/* Fallback - PNG/JPEG */}
      <img 
        src={design.images[page].public_url} 
        loading="lazy"
        alt={design.images[page].alt_text}
      />
    </picture>
  );
};
```

## Migration Strategy

### Phase 1: Setup New Structure (Immediate)
1. Run migration `017_create_published_designs_structure.sql`
2. Create new storage buckets with proper policies
3. Implement enhanced storage service

### Phase 2: Migrate Existing Data (Week 1)
1. Copy existing published designs to new structure
2. Process images into multiple formats
3. Update frontend to use new URLs

### Phase 3: Optimize & Scale (Week 2)
1. Enable CDN acceleration
2. Implement image processing pipeline
3. Add analytics and monitoring

## Monitoring & Analytics

### Storage Metrics
- Total storage used per bucket
- Image processing success rate
- CDN hit/miss ratios
- Average image load times

### Usage Analytics
- Most viewed designs
- Popular image formats
- Geographic distribution
- Device type preferences

## Security & Compliance

### Access Policies
```sql
-- Published designs - public read access
CREATE POLICY "Public read access to published designs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'smartwish-published');

-- Draft designs - user-specific access
CREATE POLICY "Users can access own drafts" 
ON storage.objects FOR ALL 
USING (bucket_id = 'smartwish-drafts' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Data Protection
- Automatic backups (daily)
- Version control for images
- GDPR compliance (deletion capabilities)
- Content moderation integration

## Performance Targets

### Load Times
- Thumbnail load: < 200ms
- Full image load: < 1s
- Preview generation: < 5s
- Publish process: < 30s

### Scalability
- Support 100,000+ published designs
- Handle 1,000+ concurrent users
- Process 10,000+ images/day
- 99.9% uptime availability

## Cost Optimization

### Storage Tiers
- **Hot**: Recently published designs (< 30 days)
- **Warm**: Popular designs (> 100 views/month)
- **Cold**: Archived designs (< 10 views/month)

### Compression Strategy
- WebP: 85% quality (optimal size/quality ratio)
- PNG: Lossless compression
- Thumbnails: 60% JPEG quality
- Automatic cleanup of unused images (90 days)

This structure provides a robust, scalable foundation for handling thousands of published designs while maintaining excellent performance and user experience.
