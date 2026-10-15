ALTER TABLE users_entity ALTER COLUMN preferences TYPE jsonb USING preferences::jsonb;
