CREATE DATABASE IF NOT EXISTS deals_db;
USE deals_db;

CREATE TABLE IF NOT EXISTS deals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deal_name VARCHAR(255) NOT NULL,
  stage VARCHAR(100) NOT NULL,
  deal_value DECIMAL(12, 2) NOT NULL,
  status ENUM('Won', 'Lost', 'Pending') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_stage (stage),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

INSERT INTO deals (deal_name, stage, deal_value, status) VALUES
('SkyHigh Annual Booking', 'Appointment', 5451000, 'Won'),
('CRM Onboarding Package', 'Contact Made', 7214078, 'Lost'),
('Enterprise Plan Upgrade', 'Presentation', 414800, 'Won'),
('CRM Migration Project', 'Proposal Made', 1611400, 'Won'),
('Sales Pipeline Optimization', 'Qualify To Buy', 905947, 'Won'),
('Tech Solutions Integration', 'Proposal Made', 2150000, 'Pending'),
('Cloud Services Migration', 'Contact Made', 1850000, 'Lost'),
('Digital Transformation Package', 'Presentation', 3200000, 'Won'),
('API Integration Suite', 'Qualify To Buy', 1250000, 'Won'),
('Marketing Automation System', 'Appointment', 1800000, 'Pending');
