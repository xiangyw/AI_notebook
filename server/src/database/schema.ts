/**
 * 数据库表结构定义
 * 
 * 本文件定义 MySQL 数据库的表结构接口和 SQL 语句
 */

// ============================================
// 类型定义
// ============================================

/**
 * 笔记表记录
 */
export interface NoteRecord {
  id: string;
  title: string;
  path: string;
  content_hash: string | null;
  word_count: number;
  created_at: Date;
  updated_at: Date;
  is_deleted: number;
}

/**
 * 标签表记录
 */
export interface TagRecord {
  id: number;
  name: string;
  created_at: Date;
}

/**
 * 笔记 - 标签关联表记录
 */
export interface NoteTagRecord {
  note_id: string;
  tag_id: number;
}

/**
 * 文件夹表记录
 */
export interface FolderRecord {
  id: number;
  path: string;
  name: string;
  parent_path: string | null;
  created_at: Date;
}

/**
 * 全文搜索表记录
 */
export interface NotesFtsRecord {
  id: string;
  title: string;
  content: string;
}

/**
 * 设置表记录
 */
export interface SettingRecord {
  id: number;
  key_name: string;
  value_text: string | null;
  updated_at: Date;
}

// ============================================
// SQL 语句
// ============================================

/**
 * 创建笔记表的 SQL
 */
export const CREATE_NOTES_TABLE = `
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * 创建标签表的 SQL
 */
export const CREATE_TAGS_TABLE = `
  CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tags_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * 创建笔记 - 标签关联表的 SQL
 */
export const CREATE_NOTE_TAGS_TABLE = `
  CREATE TABLE IF NOT EXISTS note_tags (
    note_id VARCHAR(20) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_note_tags_tag (tag_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * 创建文件夹表的 SQL
 */
export const CREATE_FOLDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    parent_path VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_folders_path (path)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * 创建全文搜索表的 SQL
 */
export const CREATE_NOTES_FTS_TABLE = `
  CREATE TABLE IF NOT EXISTS notes_fts (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    FULLTEXT INDEX ft_title_content (title, content) WITH PARSER ngram
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * 创建用户表的 SQL
 */
export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

/**
 * 创建设置表的 SQL
 */
export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value_text TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

// ============================================
// 预编译 SQL 语句
// ============================================

/**
 * 插入或更新笔记
 */
export const UPSERT_NOTE = `
  INSERT INTO notes (id, title, path, content_hash, word_count, created_at, updated_at, is_deleted)
  VALUES (?, ?, ?, ?, ?, ?, ?, 0)
  ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    path = VALUES(path),
    content_hash = VALUES(content_hash),
    word_count = VALUES(word_count),
    updated_at = VALUES(updated_at)
`;

/**
 * 根据 ID 获取笔记
 */
export const GET_NOTE_BY_ID = `
  SELECT * FROM notes WHERE id = ? AND is_deleted = 0
`;

/**
 * 获取所有未删除的笔记
 */
export const GET_ALL_NOTES = `
  SELECT * FROM notes WHERE is_deleted = 0 ORDER BY updated_at DESC
`;

/**
 * 软删除笔记
 */
export const SOFT_DELETE_NOTE = `
  UPDATE notes SET is_deleted = 1, updated_at = ? WHERE id = ?
`;

/**
 * 永久删除笔记
 */
export const DELETE_NOTE = `
  DELETE FROM notes WHERE id = ?
`;

/**
 * 插入标签（如果不存在）
 */
export const INSERT_OR_GET_TAG = `
  INSERT INTO tags (name) VALUES (?)
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
`;

/**
 * 获取标签 ID
 */
export const GET_TAG_BY_NAME = `
  SELECT id FROM tags WHERE name = ?
`;

/**
 * 获取所有标签及其使用数量
 */
export const GET_ALL_TAGS_WITH_COUNT = `
  SELECT t.id, t.name, COUNT(nt.note_id) as count
  FROM tags t
  LEFT JOIN note_tags nt ON t.id = nt.tag_id
  GROUP BY t.id, t.name
  ORDER BY count DESC
`;

/**
 * 关联笔记和标签
 */
export const INSERT_NOTE_TAG = `
  INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)
  ON DUPLICATE KEY UPDATE note_id = VALUES(note_id)
`;

/**
 * 删除笔记的所有标签关联
 */
export const DELETE_NOTE_TAGS = `
  DELETE FROM note_tags WHERE note_id = ?
`;

/**
 * 获取笔记的标签
 */
export const GET_NOTE_TAGS = `
  SELECT t.id, t.name
  FROM tags t
  INNER JOIN note_tags nt ON t.id = nt.tag_id
  WHERE nt.note_id = ?
`;

/**
 * 插入或更新文件夹
 */
export const UPSERT_FOLDER = `
  INSERT INTO folders (path, name, parent_path)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE name = VALUES(name)
`;

/**
 * 获取所有文件夹
 */
export const GET_ALL_FOLDERS = `
  SELECT f.path, f.name, f.parent_path, COUNT(n.id) as note_count
  FROM folders f
  LEFT JOIN notes n ON f.path = SUBSTRING_INDEX(n.path, '/', 1)
  GROUP BY f.id, f.path, f.name, f.parent_path
  ORDER BY f.path
`;

/**
 * 插入或更新全文搜索记录
 */
export const UPSERT_FTS = `
  REPLACE INTO notes_fts (id, title, content)
  VALUES (?, ?, ?)
`;

/**
 * 全文搜索
 */
export const FULLTEXT_SEARCH = `
  SELECT n.*, MATCH(nft.title, nft.content) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
  FROM notes n
  INNER JOIN notes_fts nft ON n.id = nft.id
  WHERE MATCH(nft.title, nft.content) AGAINST(? IN NATURAL LANGUAGE MODE)
  AND n.is_deleted = 0
  ORDER BY relevance DESC
  LIMIT ? OFFSET ?
`;

/**
 * 获取设置值
 */
export const GET_SETTING = `
  SELECT value_text FROM settings WHERE key_name = ?
`;

/**
 * 更新设置值
 */
export const UPDATE_SETTING = `
  INSERT INTO settings (key_name, value_text)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE value_text = VALUES(value_text)
`;

/**
 * 获取统计信息
 */
export const GET_STATS = `
  SELECT 
    (SELECT COUNT(*) FROM notes WHERE is_deleted = 0) as total_notes,
    (SELECT COUNT(*) FROM folders) as total_folders,
    (SELECT COALESCE(SUM(word_count), 0) FROM notes WHERE is_deleted = 0) as total_words,
    (SELECT MAX(updated_at) FROM notes WHERE is_deleted = 0) as last_updated
`;

// ============================================
// 导出所有 SQL 语句
// ============================================

export const ALL_TABLE_CREATION_SQL = [
  CREATE_USERS_TABLE,
  CREATE_NOTES_TABLE,
  CREATE_TAGS_TABLE,
  CREATE_NOTE_TAGS_TABLE,
  CREATE_FOLDERS_TABLE,
  CREATE_NOTES_FTS_TABLE,
  CREATE_SETTINGS_TABLE,
];
