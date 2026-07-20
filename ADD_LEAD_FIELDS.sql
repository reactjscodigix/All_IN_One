ALTER TABLE leads ADD COLUMN owner_id INT AFTER notes;
ALTER TABLE leads ADD COLUMN value DECIMAL(15, 2) AFTER owner_id;
ALTER TABLE leads ADD COLUMN currency VARCHAR(10) DEFAULT 'USD' AFTER value;
ALTER TABLE leads ADD COLUMN lead_type VARCHAR(50) AFTER currency;
ALTER TABLE leads ADD COLUMN industry VARCHAR(100) AFTER lead_type;
ALTER TABLE leads ADD COLUMN visibility VARCHAR(50) DEFAULT 'Public' AFTER industry;
ALTER TABLE leads ADD COLUMN tags JSON AFTER visibility;

ALTER TABLE leads ADD INDEX idx_owner_id (owner_id);
ALTER TABLE leads ADD INDEX idx_industry (industry);
