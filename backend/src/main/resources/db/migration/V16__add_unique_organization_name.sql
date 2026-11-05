-- Add unique index for organization name (case-insensitive and trimmed), ignoring soft-deleted records
CREATE UNIQUE INDEX IF NOT EXISTS uk_organizations_name 
ON organizations (lower(trim(name))) 
WHERE deleted_at IS NULL;
