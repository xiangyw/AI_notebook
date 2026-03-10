// 笔记元数据（Front Matter）
export interface NoteFrontMatter {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  folder?: string;
}

// 完整笔记（包含内容和元数据）
export interface Note {
  id: string;
  title: string;
  content: string;
  path: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
}

// 笔记摘要（用于列表）
export interface NoteSummary {
  id: string;
  title: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  tags: string[];
}

// 文件夹信息
export interface FolderInfo {
  name: string;
  path: string;
  noteCount: number;
}

// 标签信息
export interface TagInfo {
  name: string;
  count: number;
}

// 统计信息
export interface Stats {
  totalNotes: number;
  totalFolders: number;
  totalWords: number;
  lastUpdated: Date;
}

// 搜索结果
export interface SearchResult {
  id: string;
  title: string;
  path: string;
  excerpt: string;
  matchScore: number;
  highlights: Highlight[];
  tags?: string[];
}

export interface Highlight {
  field: 'title' | 'content';
  positions: [number, number][];
}

// 创建笔记输入
export interface CreateNoteInput {
  title: string;
  content: string;
  path?: string;
  tags?: string[];
}

// 更新笔记输入
export interface UpdateNoteInput {
  title?: string;
  content?: string;
  path?: string;
  tags?: string[];
}

// 搜索参数
export interface SearchParams {
  q: string;
  inTitle?: boolean;
  inContent?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}

// 列表查询参数
export interface ListQueryParams {
  path?: string;
  recursive?: boolean;
  sortBy?: 'title' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// 错误码
export const ErrorCodes = {
  NOTE_NOT_FOUND: 'NOTE_NOT_FOUND',
  NOTE_ALREADY_EXISTS: 'NOTE_ALREADY_EXISTS',
  INVALID_PATH: 'INVALID_PATH',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  SEARCH_ERROR: 'SEARCH_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

// 数据库配置类型
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// 应用配置类型
export interface AppConfig {
  port: number;
  env: string;
  database: DatabaseConfig;
  dataDir: string;
}
