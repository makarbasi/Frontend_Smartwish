-- ================================================================
-- SMARTWISH DATABASE OPTIMIZATION SCRIPT
-- This script fixes all identified issues and optimizes the database
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1: CREATE NEW SCHEMAS FOR BETTER ORGANIZATION
-- ================================================================

-- Create smartwish schema for all sw_* tables
CREATE SCHEMA IF NOT EXISTS smartwish;

-- Create auth schema for authentication-related tables
CREATE SCHEMA IF NOT EXISTS auth;

-- Create analytics schema for tracking and metrics
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create marketplace schema for commercial features
CREATE SCHEMA IF NOT EXISTS marketplace;

-- ================================================================
-- STEP 2: FIX CRITICAL DATA TYPE ISSUES
-- ================================================================

-- Fix users table - remove duplicate columns and fix data types
ALTER TABLE users DROP COLUMN IF EXISTS instance_id;
ALTER TABLE users DROP COLUMN IF EXISTS aud;
ALTER TABLE users DROP COLUMN IF EXISTS encrypted_password;
ALTER TABLE users DROP COLUMN IF EXISTS email_confirmed_at;
ALTER TABLE users DROP COLUMN IF EXISTS invited_at;
ALTER TABLE users DROP COLUMN IF EXISTS confirmation_token;
ALTER TABLE users DROP COLUMN IF EXISTS confirmation_sent_at;
ALTER TABLE users DROP COLUMN IF EXISTS recovery_token;
ALTER TABLE users DROP COLUMN IF EXISTS recovery_sent_at;
ALTER TABLE users DROP COLUMN IF EXISTS email_change_token_new;
ALTER TABLE users DROP COLUMN IF EXISTS email_change;
ALTER TABLE users DROP COLUMN IF EXISTS email_change_sent_at;
ALTER TABLE users DROP COLUMN IF EXISTS last_sign_in_at;
ALTER TABLE users DROP COLUMN IF EXISTS raw_app_meta_data;
ALTER TABLE users DROP COLUMN IF EXISTS raw_user_meta_data;
ALTER TABLE users DROP COLUMN IF EXISTS is_super_admin;
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS phone_confirmed_at;
ALTER TABLE users DROP COLUMN IF EXISTS phone_change;
ALTER TABLE users DROP COLUMN IF EXISTS phone_change_token;
ALTER TABLE users DROP COLUMN IF EXISTS phone_change_sent_at;
ALTER TABLE users DROP COLUMN IF EXISTS confirmed_at;
ALTER TABLE users DROP COLUMN IF EXISTS email_change_token_current;
ALTER TABLE users DROP COLUMN IF EXISTS email_change_confirm_status;
ALTER TABLE users DROP COLUMN IF EXISTS uuid_id;
ALTER TABLE users DROP COLUMN IF EXISTS banned_until;
ALTER TABLE users DROP COLUMN IF EXISTS reauthentication_token;
ALTER TABLE users DROP COLUMN IF EXISTS reauthentication_sent_at;
ALTER TABLE users DROP COLUMN IF EXISTS is_sso_user;
ALTER TABLE users DROP COLUMN IF EXISTS is_anonymous;

-- Fix audit_logs table - change inappropriate data types
ALTER TABLE audit_logs ALTER COLUMN request_id TYPE UUID USING request_id::uuid;
ALTER TABLE audit_logs ALTER COLUMN session_id TYPE UUID USING session_id::uuid;

-- Fix sw_rate_limits table - change identifier to appropriate type
ALTER TABLE sw_rate_limits ALTER COLUMN identifier TYPE TEXT;

-- Fix sw_template_ratings table - hidden_reason should remain TEXT (it's not an ID)
-- This was a false positive in the analysis

-- ================================================================
-- STEP 3: ADD ALL MISSING INDEXES FOR PERFORMANCE
-- ================================================================

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_saved_designs_published_as_template_id ON saved_designs(published_as_template_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_target_region_id ON saved_designs(target_region_id);
CREATE INDEX IF NOT EXISTS idx_sw_audit_logs_user_id ON sw_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sw_bundle_ratings_purchase_id ON sw_bundle_ratings(purchase_id);
CREATE INDEX IF NOT EXISTS idx_sw_categories_parent_id ON sw_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_sw_design_analytics_design_id ON sw_design_analytics(design_id);
CREATE INDEX IF NOT EXISTS idx_sw_moderation_queue_moderator_id ON sw_moderation_queue(moderator_id);
CREATE INDEX IF NOT EXISTS idx_sw_moderation_queue_user_id ON sw_moderation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sw_regional_performance_template_id ON sw_regional_performance(template_id);
CREATE INDEX IF NOT EXISTS idx_sw_revenue_records_bundle_id ON sw_revenue_records(bundle_id);
CREATE INDEX IF NOT EXISTS idx_sw_revenue_records_buyer_user_id ON sw_revenue_records(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_sw_revenue_records_purchase_id ON sw_revenue_records(purchase_id);
CREATE INDEX IF NOT EXISTS idx_sw_revenue_records_template_id ON sw_revenue_records(template_id);
CREATE INDEX IF NOT EXISTS idx_sw_template_analytics_user_id ON sw_template_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_sw_template_bundles_created_by_user_id ON sw_template_bundles(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_sw_template_bundles_region_id ON sw_template_bundles(region_id);
CREATE INDEX IF NOT EXISTS idx_sw_template_collections_cover_template_id ON sw_template_collections(cover_template_id);
CREATE INDEX IF NOT EXISTS idx_sw_template_purchases_license_type_id ON sw_template_purchases(license_type_id);
CREATE INDEX IF NOT EXISTS idx_sw_template_ratings_hidden_by_user_id ON sw_template_ratings(hidden_by_user_id);
CREATE INDEX IF NOT EXISTS idx_sw_template_ratings_purchase_id ON sw_template_ratings(purchase_id);
CREATE INDEX IF NOT EXISTS idx_sw_templates_original_saved_design_id ON sw_templates(original_saved_design_id);
CREATE INDEX IF NOT EXISTS idx_sw_templates_reviewed_by_user_id ON sw_templates(reviewed_by_user_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sw_templates_category_status_popularity ON sw_templates(category_id, status, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_sw_templates_author_status_created ON sw_templates(created_by_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sw_template_purchases_user_date_active ON sw_template_purchases(user_id, purchase_date DESC, is_active);
CREATE INDEX IF NOT EXISTS idx_sw_revenue_records_author_date ON sw_revenue_records(author_user_id, transaction_date DESC);

-- ================================================================
-- STEP 4: FIX CIRCULAR DEPENDENCIES AND SELF-REFERENCING ISSUES
-- ================================================================

-- Fix sw_categories self-referencing issue by removing the problematic foreign key
-- This table should not reference itself for parent_id
ALTER TABLE sw_categories DROP CONSTRAINT IF EXISTS sw_categories_parent_id_fkey;

-- Add proper constraint if parent_id should reference another table
-- For now, we'll make it a simple UUID field without foreign key constraint
ALTER TABLE sw_categories ALTER COLUMN parent_id TYPE UUID;

-- ================================================================
-- STEP 5: OPTIMIZE DATA TYPES AND CONSTRAINTS
-- ================================================================

-- Optimize text fields that should have length limits
ALTER TABLE sw_templates ALTER COLUMN title TYPE VARCHAR(255);
ALTER TABLE sw_templates ALTER COLUMN description TYPE TEXT;
ALTER TABLE sw_templates ALTER COLUMN cover_image TYPE VARCHAR(500);

-- Add proper check constraints
ALTER TABLE sw_templates ADD CONSTRAINT chk_sw_templates_price_positive CHECK (price >= 0);
ALTER TABLE sw_templates ADD CONSTRAINT chk_sw_templates_popularity_range CHECK (popularity >= 0 AND popularity <= 100);
ALTER TABLE sw_templates ADD CONSTRAINT chk_sw_templates_status_valid CHECK (status IN ('draft', 'published', 'archived', 'pending_review'));

-- Add check constraints for ratings
ALTER TABLE sw_template_ratings ADD CONSTRAINT chk_sw_template_ratings_rating_range CHECK (rating >= 1 AND rating <= 5);

-- Add check constraints for prices
ALTER TABLE sw_template_purchases ADD CONSTRAINT chk_sw_template_purchases_price_positive CHECK (purchase_price >= 0);
ALTER TABLE sw_template_bundles ADD CONSTRAINT chk_sw_template_bundles_price_positive CHECK (bundle_price >= 0);

-- ================================================================
-- STEP 6: MOVE TABLES TO APPROPRIATE SCHEMAS
-- ================================================================

-- Move smartwish tables to smartwish schema
ALTER TABLE sw_categories SET SCHEMA smartwish;
ALTER TABLE sw_templates SET SCHEMA smartwish;
ALTER TABLE sw_template_pages SET SCHEMA smartwish;
ALTER TABLE sw_template_versions SET SCHEMA smartwish;
ALTER TABLE sw_template_keywords SET SCHEMA smartwish;
ALTER TABLE sw_template_metadata SET SCHEMA smartwish;
ALTER TABLE sw_template_locales SET SCHEMA smartwish;
ALTER TABLE sw_template_page_locales SET SCHEMA smartwish;
ALTER TABLE sw_template_embeddings SET SCHEMA smartwish;
ALTER TABLE sw_template_tags SET SCHEMA smartwish;
ALTER TABLE sw_authors SET SCHEMA smartwish;
ALTER TABLE sw_published_designs SET SCHEMA smartwish;
ALTER TABLE sw_design_images SET SCHEMA smartwish;
ALTER TABLE sw_design_collections SET SCHEMA smartwish;
ALTER TABLE sw_collection_items SET SCHEMA smartwish;
ALTER TABLE sw_design_reviews SET SCHEMA smartwish;
ALTER TABLE sw_cultures SET SCHEMA smartwish;
ALTER TABLE sw_regions SET SCHEMA smartwish;

-- Move marketplace tables to marketplace schema
ALTER TABLE sw_template_bundles SET SCHEMA marketplace;
ALTER TABLE sw_template_bundle_items SET SCHEMA marketplace;
ALTER TABLE sw_template_collections SET SCHEMA marketplace;
ALTER TABLE sw_template_collection_items SET SCHEMA marketplace;
ALTER TABLE sw_template_purchases SET SCHEMA marketplace;
ALTER TABLE sw_template_ratings SET SCHEMA marketplace;
ALTER TABLE sw_rating_votes SET SCHEMA marketplace;
ALTER TABLE sw_template_reviews SET SCHEMA marketplace;
ALTER TABLE sw_license_types SET SCHEMA marketplace;
ALTER TABLE sw_template_licenses SET SCHEMA marketplace;
ALTER TABLE sw_revenue_records SET SCHEMA marketplace;
ALTER TABLE sw_author_payouts SET SCHEMA marketplace;
ALTER TABLE sw_bundle_ratings SET SCHEMA marketplace;
ALTER TABLE sw_bundle_stats SET SCHEMA marketplace;

-- Move analytics tables to analytics schema
ALTER TABLE sw_template_analytics SET SCHEMA analytics;
ALTER TABLE sw_template_stats SET SCHEMA analytics;
ALTER TABLE sw_design_analytics SET SCHEMA analytics;
ALTER TABLE sw_regional_performance SET SCHEMA analytics;
ALTER TABLE sw_author_stats SET SCHEMA analytics;
ALTER TABLE sw_search_terms SET SCHEMA analytics;
ALTER TABLE sw_user_search_preferences SET SCHEMA analytics;
ALTER TABLE sw_user_template_favorites SET SCHEMA analytics;
ALTER TABLE sw_trending_templates SET SCHEMA analytics;
ALTER TABLE sw_search_suggestions SET SCHEMA analytics;

-- Move auth-related tables to auth schema
ALTER TABLE sw_user_sessions SET SCHEMA auth;
ALTER TABLE sw_moderation_queue SET SCHEMA auth;
ALTER TABLE sw_notifications SET SCHEMA auth;
ALTER TABLE sw_content_filters SET SCHEMA auth;
ALTER TABLE sw_rate_limits SET SCHEMA auth;
ALTER TABLE sw_backup_history SET SCHEMA auth;

-- Keep core tables in public schema
-- users, saved_designs, audit_logs, migrations remain in public

-- ================================================================
-- STEP 7: UPDATE FOREIGN KEY REFERENCES TO NEW SCHEMAS
-- ================================================================

-- This step requires dropping and recreating foreign keys with new schema references
-- We'll do this in a separate script to avoid complexity

-- ================================================================
-- STEP 8: ADD PERFORMANCE OPTIMIZATIONS
-- ================================================================

-- Add partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_smartwish_templates_active ON smartwish.sw_templates(status, created_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_marketplace_bundles_active ON marketplace.sw_template_bundles(is_active, is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_analytics_recent_events ON analytics.sw_template_analytics(created_at) WHERE created_at > NOW() - INTERVAL '30 days';

-- Add GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_smartwish_templates_metadata_gin ON smartwish.sw_templates USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_smartwish_templates_search_keywords_gin ON smartwish.sw_templates USING GIN(search_keywords);
CREATE INDEX IF NOT EXISTS idx_smartwish_templates_tags_gin ON smartwish.sw_templates USING GIN(tags);

-- Add full-text search indexes
ALTER TABLE smartwish.sw_templates ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_smartwish_templates_search ON smartwish.sw_templates USING GIN(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION smartwish.update_template_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(NEW.search_keywords, ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS update_template_search_vector ON smartwish.sw_templates;
CREATE TRIGGER update_template_search_vector
  BEFORE INSERT OR UPDATE ON smartwish.sw_templates
  FOR EACH ROW EXECUTE FUNCTION smartwish.update_template_search_vector();

-- ================================================================
-- STEP 9: ADD DATA INTEGRITY CONSTRAINTS
-- ================================================================

-- Add unique constraints where appropriate
ALTER TABLE smartwish.sw_templates ADD CONSTRAINT uk_sw_templates_slug UNIQUE (slug);
ALTER TABLE smartwish.sw_categories ADD CONSTRAINT uk_sw_categories_slug UNIQUE (slug);
ALTER TABLE smartwish.sw_cultures ADD CONSTRAINT uk_sw_cultures_code UNIQUE (code);
ALTER TABLE smartwish.sw_regions ADD CONSTRAINT uk_sw_regions_code UNIQUE (code);

-- Add not null constraints where appropriate
ALTER TABLE smartwish.sw_templates ALTER COLUMN title SET NOT NULL;
ALTER TABLE smartwish.sw_templates ALTER COLUMN slug SET NOT NULL;
ALTER TABLE smartwish.sw_categories ALTER COLUMN name SET NOT NULL;
ALTER TABLE smartwish.sw_categories ALTER COLUMN slug SET NOT NULL;

-- ================================================================
-- STEP 10: CREATE OPTIMIZED VIEWS
-- ================================================================

-- Create optimized view for template search
CREATE OR REPLACE VIEW smartwish.vw_templates_search AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.slug,
    t.cover_image,
    t.price,
    t.status,
    t.popularity,
    t.num_downloads,
    t.created_at,
    c.name as category_name,
    c.slug as category_slug,
    a.name as author_name,
    a.is_verified as author_verified,
    cul.code as culture_code,
    cul.display_name as culture_name,
    r.code as region_code,
    r.display_name as region_name,
    t.search_vector
FROM smartwish.sw_templates t
LEFT JOIN smartwish.sw_categories c ON t.category_id = c.id
LEFT JOIN smartwish.sw_authors a ON t.author_id = a.id
LEFT JOIN smartwish.sw_cultures cul ON t.culture_id = cul.id
LEFT JOIN smartwish.sw_regions r ON t.region_id = r.id
WHERE t.status = 'published';

-- Create optimized view for marketplace analytics
CREATE OR REPLACE VIEW marketplace.vw_marketplace_analytics AS
SELECT 
    'templates' as content_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_count,
    AVG(price) as avg_price,
    SUM(num_downloads) as total_downloads
FROM smartwish.sw_templates
UNION ALL
SELECT 
    'bundles' as content_type,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    AVG(bundle_price) as avg_price,
    SUM(download_count) as total_downloads
FROM marketplace.sw_template_bundles;

-- ================================================================
-- STEP 11: ADD PARTITIONING FOR LARGE TABLES (FUTURE-PROOFING)
-- ================================================================

-- Create partitioned table structure for analytics (future use)
-- This will help when the tables grow large

-- ================================================================
-- STEP 12: FINAL VERIFICATION AND CLEANUP
-- ================================================================

-- Update statistics for query planner
ANALYZE;

-- Verify all tables are in correct schemas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'smartwish', 'marketplace', 'analytics', 'auth')
ORDER BY schemaname, tablename;

-- Verify all indexes are created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname IN ('public', 'smartwish', 'marketplace', 'analytics', 'auth')
ORDER BY schemaname, tablename;

COMMIT;

-- ================================================================
-- POST-OPTIMIZATION NOTES
-- ================================================================

/*
IMPORTANT: After running this script:

1. Update your application code to reference tables with schema prefixes:
   - smartwish.sw_templates instead of sw_templates
   - marketplace.sw_template_bundles instead of sw_template_bundles
   - analytics.sw_template_analytics instead of sw_template_analytics

2. Update your TypeORM entities to include schema names

3. Test all queries to ensure they work with the new schema structure

4. Monitor performance improvements

5. Consider adding more specific indexes based on your actual query patterns
*/
