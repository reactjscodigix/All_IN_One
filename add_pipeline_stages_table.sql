ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Inactive') DEFAULT 'Active';
ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS created_by INT;

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pipeline_id INT NOT NULL,
  stage_name VARCHAR(255) NOT NULL,
  stage_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE,
  INDEX idx_pipeline_id (pipeline_id),
  UNIQUE KEY unique_pipeline_stage (pipeline_id, stage_name)
);

CREATE TABLE IF NOT EXISTS pipeline_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pipeline_id INT NOT NULL,
  access_type ENUM('All', 'Selected') DEFAULT 'All',
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE,
  INDEX idx_pipeline_id (pipeline_id),
  INDEX idx_user_id (user_id)
);
