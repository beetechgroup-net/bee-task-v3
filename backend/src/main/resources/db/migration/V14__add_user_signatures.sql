CREATE TABLE user_signatures (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users_entity(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    signature_type VARCHAR(50) NOT NULL, -- 'UPLOAD', 'DRAW', 'TEMPLATE'
    image_url VARCHAR(1024) NOT NULL,
    storage_key VARCHAR(512),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_signatures_user ON user_signatures(user_id);
