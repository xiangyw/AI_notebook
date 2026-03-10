-- ===========================================
-- Notebook Database Initialization Script
-- MySQL 8.0
-- ===========================================

-- Use the notebook database
USE notebook;

-- -------------------------------------------
-- Notes Table - Store note metadata
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    path VARCHAR(500) UNIQUE NOT NULL,
    content_hash VARCHAR(64),
    word_count INT DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    INDEX idx_notes_updated (updated_at DESC),
    INDEX idx_notes_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Tags Table - Store tag definitions
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Note-Tags Relationship Table
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS note_tags (
    note_id VARCHAR(20) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_note_tags_tag (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Folders Table - Store folder structure
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_folders_path (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Full-Text Search Table (FTS)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS notes_fts (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    FULLTEXT INDEX ft_title_content (title, content) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Users Table - Store user accounts
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Application Settings Table
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value_text TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Insert default settings
-- -------------------------------------------
INSERT INTO settings (key_name, value_text) VALUES
    ('version', '1.0.0'),
    ('created_at', NOW())
ON DUPLICATE KEY UPDATE value_text = VALUES(value_text);

-- -------------------------------------------
-- Create database user with limited privileges
-- -------------------------------------------
-- Note: User is created via docker-compose environment variables
-- This script assumes the user already exists

-- Grant privileges to notebook user
GRANT SELECT, INSERT, UPDATE, DELETE ON notebook.* TO 'notebook'@'%';
FLUSH PRIVILEGES;
