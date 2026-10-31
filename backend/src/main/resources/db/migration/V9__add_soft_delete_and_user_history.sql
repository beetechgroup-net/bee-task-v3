-- 1. Soft Delete columns on all core entities
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users_entity ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE user_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 2. Author tracking in task_history
ALTER TABLE task_history ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users_entity(id);

-- Backfill user_id on existing history records with the task assignee (or creator fallback)
UPDATE task_history th
SET user_id = COALESCE(t.user_id, t.created_by_id)
FROM tasks t
WHERE th.task_id = t.id AND th.user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_task_history_user_id ON task_history(user_id);

-- 3. Partial Unique Indexes compatible with Soft Delete
ALTER TABLE user_organizations DROP CONSTRAINT IF EXISTS uk_user_organizations_user_org;
DROP INDEX IF EXISTS uk_user_organizations_user_org;
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_organizations_active 
ON user_organizations (user_id, organization_id) 
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_projects_org_name 
ON projects (organization_id, lower(name)) 
WHERE deleted_at IS NULL;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS uk_categories_org_name;
DROP INDEX IF EXISTS uk_categories_org_name;
CREATE UNIQUE INDEX IF NOT EXISTS uk_categories_org_name 
ON categories (organization_id, lower(name)) 
WHERE deleted_at IS NULL;
