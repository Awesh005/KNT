CREATE INDEX idx_campaigns_status ON campaigns(status, deleted_at);
CREATE INDEX idx_campaigns_urgent ON campaigns(is_urgent, deleted_at);
CREATE INDEX idx_campaigns_featured ON campaigns(is_featured, deleted_at);
CREATE INDEX idx_campaigns_category ON campaigns(category, deleted_at);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created ON donations(created_at);
CREATE INDEX idx_requests_status ON fundraiser_requests(status);
CREATE INDEX idx_content_modules_type ON content_modules(type);
