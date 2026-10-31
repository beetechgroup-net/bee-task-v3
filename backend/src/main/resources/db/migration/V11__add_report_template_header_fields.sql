ALTER TABLE report_templates ADD COLUMN manager_name VARCHAR(255);
ALTER TABLE report_templates ADD COLUMN custom_project_name VARCHAR(255);
ALTER TABLE report_templates ADD COLUMN date_format_pattern VARCHAR(100) DEFAULT 'DD/MM/AAAA até DD/MM/AAAA';
