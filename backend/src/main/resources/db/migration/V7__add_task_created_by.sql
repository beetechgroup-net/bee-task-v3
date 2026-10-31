ALTER TABLE tasks ADD COLUMN created_by_id BIGINT;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by_id) REFERENCES users_entity (id);
UPDATE tasks SET created_by_id = user_id WHERE created_by_id IS NULL AND user_id IS NOT NULL;
UPDATE tasks SET created_by_id = (SELECT id FROM users_entity ORDER BY id ASC LIMIT 1) WHERE created_by_id IS NULL;
CREATE INDEX idx_tasks_created_by_id ON tasks (created_by_id);

ALTER TABLE task_history DROP CONSTRAINT IF EXISTS fk_task_history_task;
ALTER TABLE task_history ADD CONSTRAINT fk_task_history_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE;
