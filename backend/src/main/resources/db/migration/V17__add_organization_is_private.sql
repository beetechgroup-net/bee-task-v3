-- Add is_private column to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

-- Personal organizations must always be private
UPDATE organizations 
SET is_private = true 
WHERE lower(name) LIKE '%pessoal%' OR lower(name) LIKE 'workspace de%';

-- Index for fast search filtering of public organizations
CREATE INDEX IF NOT EXISTS idx_organizations_public_search 
ON organizations (lower(name)) 
WHERE is_private = false AND deleted_at IS NULL;
