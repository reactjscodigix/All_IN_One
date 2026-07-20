ALTER TABLE followups ADD COLUMN previous_followup_id INT AFTER next_followup_type;
ALTER TABLE followups ADD CONSTRAINT fk_followups_previous FOREIGN KEY (previous_followup_id) REFERENCES followups(id) ON DELETE SET NULL;
ALTER TABLE followups ADD INDEX idx_previous_followup (previous_followup_id);
