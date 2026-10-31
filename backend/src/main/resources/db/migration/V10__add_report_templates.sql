CREATE TABLE report_templates (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scope VARCHAR(32) NOT NULL DEFAULT 'ORGANIZATION',
    file_url VARCHAR(1024) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    created_by BIGINT REFERENCES users_entity(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_templates_org ON report_templates(organization_id);
CREATE INDEX idx_report_templates_proj ON report_templates(project_id);

CREATE TABLE report_sections (
    id BIGSERIAL PRIMARY KEY,
    report_template_id BIGINT NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    section_key VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    section_type VARCHAR(50) NOT NULL, -- 'FREE_TEXT' ou 'TASK_LIST'
    filter_category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    filter_status VARCHAR(50) DEFAULT 'ALL',
    include_time BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_sections_template ON report_sections(report_template_id);

CREATE TABLE generated_reports (
    id BIGSERIAL PRIMARY KEY,
    report_template_id BIGINT REFERENCES report_templates(id) ON DELETE SET NULL,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users_entity(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    file_url VARCHAR(1024) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_reports_org ON generated_reports(organization_id);
CREATE INDEX idx_generated_reports_user ON generated_reports(user_id);
