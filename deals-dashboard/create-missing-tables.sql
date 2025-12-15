-- Create missing tables for conversations and messages

-- Users table (if doesn't exist)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  phone1 VARCHAR(20),
  location VARCHAR(255),
  avatar LONGTEXT,
  status ENUM('Active', 'Inactive', 'Away') DEFAULT 'Active',
  role_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant1_id INT NOT NULL,
  participant2_id INT NOT NULL,
  last_message_text TEXT,
  last_message_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_participant1 (participant1_id),
  INDEX idx_participant2 (participant2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message_text TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation (conversation_id),
  INDEX idx_sender (sender_id),
  INDEX idx_receiver (receiver_id)
);

-- Roles table (if doesn't exist)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Insert sample users (if not exists)
INSERT IGNORE INTO users (first_name, last_name, email, username, password, status, role_id) VALUES
('Admin', 'User', 'admin@example.com', 'admin', 'hashed_password', 'Active', 1),
('Sales', 'Rep', 'sales@example.com', 'sales', 'hashed_password', 'Active', 2),
('Support', 'Agent', 'support@example.com', 'support', 'hashed_password', 'Active', 3);

-- Verify data was inserted
SELECT 'Users Created:' as Status, COUNT(*) as Count FROM users;
SELECT 'Conversations Table:' as Status, 'Created' as Result;
SELECT 'Messages Table:' as Status, 'Created' as Result;
