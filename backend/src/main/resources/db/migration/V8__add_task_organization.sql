ALTER TABLE tasks ADD COLUMN organization_id BIGINT REFERENCES organizations(id);

-- Populate organization_id from projects if available
UPDATE tasks t
SET organization_id = p.organization_id
FROM projects p
WHERE t.project_id = p.id;

-- Populate organization_id from categories if project was null
UPDATE tasks t
SET organization_id = c.organization_id
FROM categories c
WHERE t.category_id = c.id AND t.organization_id IS NULL;

-- Fallback for any orphaned tasks to organization 1 (or first organization)
UPDATE tasks
SET organization_id = (SELECT id FROM organizations ORDER BY id ASC LIMIT 1)
WHERE organization_id IS NULL;

CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
