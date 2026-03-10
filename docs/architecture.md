# Notebook 项目技术架构方案

**版本**: 2.0  
**日期**: 2026-03-07  
**作者**: CTO Gilfoyle

---

## 1. 技术栈选型

### 1.1 前端技术栈

| 组件 | 技术选型 | 理由 |
|------|----------|------|
| 框架 | **React 18** | 组件化开发，生态成熟，适合编辑器类应用 |
| 语言 | **TypeScript 5** | 类型安全，提升代码质量和可维护性 |
| 构建工具 | **Vite 5** | 快速开发启动，优秀的 HMR 支持 |
| Markdown 编辑器 | **@monaco-editor/react** | VS Code 同款编辑器，支持语法高亮、代码折叠 |
| Markdown 渲染 | **react-markdown** + **remark-gfm** | 支持 GFM 扩展，轻量灵活 |
| 状态管理 | **Zustand** | 轻量级状态管理，比 Redux 更简洁 |
| UI 组件库 | **shadcn/ui** + **Tailwind CSS** | 高度可定制，现代设计风格 |
| 搜索高亮 | **mark.js** | 客户端搜索关键词高亮 |

### 1.2 后端技术栈

| 组件 | 技术选型 | 理由 |
|------|----------|------|
| 运行时 | **Node.js 20 LTS** | 与前端技术栈统一，I/O 密集型场景性能优秀 |
| 框架 | **Express 4** | 成熟稳定，中间件生态丰富 |
| 语言 | **TypeScript 5** | 与前端共享类型定义，全栈类型安全 |
| 文件监控 | **chokidar** | 跨平台文件监听，支持热重载 |
| 搜索 | **flexsearch** | 客户端全文搜索，无需额外数据库 |
| API 文档 | **Swagger/OpenAPI** | 标准化 API 文档 |

### 1.3 数据存储

| 组件 | 技术选型 | 理由 |
|------|----------|------|
| 笔记存储 | **本地文件系统 (Markdown)** | 用户数据完全可控，便于版本管理和备份 |
| 索引数据库 | **MySQL 8 (Docker)** | 生产级数据库，支持多项目扩展，Docker 部署便于管理 |
| 配置存储 | **JSON 文件** | 简单配置直接存储为 JSON |

### 1.4 技术架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                         前端 (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  笔记列表   │  ┌─────────────┐  │   搜索栏    │          │
│  │   组件      │  │  Markdown   │  │   组件      │          │
│  └─────────────┘  │   编辑器    │  └─────────────┘          │
│                   └─────────────┘                           │
│                          │                                    │
│                    HTTP/REST API                              │
└──────────────────────────┼────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────┐
│                    后端 (Express + TS)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  文件操作   │  │   搜索      │  │   元数据    │          │
│  │   服务      │  │   服务      │  │   服务      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 本地文件夹  │  │   MySQL     │  │  配置文件   │          │
│  │  (.md 文件) │  │  (Docker)   │  │  (JSON)     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────┐
│                    Docker Compose                             │
│  ┌─────────────┐  ┌─────────────┐                            │
│  │   App       │  │   MySQL     │                            │
│  │  Container  │  │  Container  │                            │
│  └─────────────┘  └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 项目目录结构

```
/home/ubuntu-user/.openclaw/project/notebook/
├── package.json                 # 项目配置和依赖
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 构建配置
├── .env.example                 # 环境变量模板
├── .dockerignore                # Docker 忽略文件
├── docker-compose.yml           # Docker Compose 配置
├── README.md                    # 项目说明
├── docs/                        # 文档目录
│   ├── architecture.md          # 技术架构文档
│   └── api.md                   # API 接口文档
│
├── client/                      # 前端代码
│   ├── index.html               # HTML 入口
│   ├── src/
│   │   ├── main.tsx             # React 入口
│   │   ├── App.tsx              # 根组件
│   │   ├── components/          # 可复用组件
│   │   │   ├── Editor/          # Markdown 编辑器组件
│   │   │   │   ├── Editor.tsx
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   └── Preview.tsx
│   │   │   ├── NoteList/        # 笔记列表组件
│   │   │   │   ├── NoteList.tsx
│   │   │   │   ├── NoteItem.tsx
│   │   │   │   └── NoteTree.tsx
│   │   │   ├── Search/          # 搜索组件
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── SearchResult.tsx
│   │   │   └── ui/              # 基础 UI 组件
│   │   ├── hooks/               # 自定义 Hooks
│   │   │   ├── useNotes.ts
│   │   │   ├── useSearch.ts
│   │   │   └── useAutoSave.ts
│   │   ├── stores/              # Zustand 状态管理
│   │   │   ├── noteStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/               # TypeScript 类型定义
│   │   │   └── index.ts
│   │   ├── utils/               # 工具函数
│   │   │   ├── api.ts           # API 调用封装
│   │   │   └── markdown.ts      # Markdown 处理
│   │   └── styles/              # 样式文件
│   │       └── index.css
│   └── public/                  # 静态资源
│
├── server/                      # 后端代码
│   ├── src/
│   │   ├── index.ts             # 服务器入口
│   │   ├── app.ts               # Express 应用
│   │   ├── config/              # 配置管理
│   │   │   └── index.ts
│   │   ├── routes/              # API 路由
│   │   │   ├── notes.ts         # 笔记相关路由
│   │   │   ├── search.ts        # 搜索相关路由
│   │   │   └── meta.ts          # 元数据路由
│   │   ├── services/            # 业务逻辑层
│   │   │   ├── noteService.ts   # 笔记文件操作
│   │   │   ├── searchService.ts # 搜索服务
│   │   │   └── indexService.ts  # 索引管理
│   │   ├── database/            # 数据库相关
│   │   │   ├── schema.sql       # MySQL 表结构
│   │   │   └── db.ts            # 数据库连接
│   │   ├── middleware/          # Express 中间件
│   │   │   ├── errorHandler.ts
│   │   │   └── cors.ts
│   │   └── types/               # 类型定义
│   │       └── index.ts
│   └── data/                    # 数据目录 (运行时创建)
│       └── notes/               # Markdown 笔记文件
│
├── docker/                      # Docker 相关配置
│   ├── app/
│   │   └── Dockerfile           # 应用容器镜像
│   └── mysql/
│       └── init.sql             # MySQL 初始化脚本
│
├── scripts/                     # 构建和工具脚本
│   ├── build.ts
│   └── dev.ts
│
└── tests/                       # 测试代码
    ├── client/                  # 前端测试
    └── server/                  # 后端测试
```

---

## 3. 核心 API 设计

### 3.1 API 基础规范

- **基础路径**: `/api/v1`
- **数据格式**: JSON (`Content-Type: application/json`)
- **字符编码**: UTF-8
- **认证方式**: 本地应用，暂不需要认证

### 3.2 笔记管理 API

#### 3.2.1 获取笔记列表

```http
GET /api/v1/notes
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `path` | string | 否 | 文件夹路径，支持嵌套 |
| `recursive` | boolean | 否 | 是否递归获取子目录，默认 false |
| `sortBy` | string | 否 | 排序字段：`title` | `updatedAt` | `createdAt` |
| `sortOrder` | string | 否 | 排序方向：`asc` | `desc` |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "20260307-001",
        "title": "项目会议纪要",
        "path": "meetings/20260307-001.md",
        "createdAt": "2026-03-07T10:00:00Z",
        "updatedAt": "2026-03-07T11:30:00Z",
        "wordCount": 1250,
        "tags": ["会议", "项目"]
      }
    ],
    "folders": [
      {
        "name": "meetings",
        "path": "meetings",
        "noteCount": 15
      }
    ]
  }
}
```

#### 3.2.2 获取单篇笔记

```http
GET /api/v1/notes/:id
```

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 笔记 ID 或文件路径 (URL 编码) |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "20260307-001",
    "title": "项目会议纪要",
    "content": "# 项目会议纪要\n\n## 参会人员\n- ...",
    "path": "meetings/20260307-001.md",
    "createdAt": "2026-03-07T10:00:00Z",
    "updatedAt": "2026-03-07T11:30:00Z",
    "wordCount": 1250,
    "tags": ["会议", "项目"]
  }
}
```

#### 3.2.3 创建笔记

```http
POST /api/v1/notes
```

**请求体**:
```json
{
  "title": "新笔记标题",
  "content": "# 笔记内容\n\n正文...",
  "path": "folder/note.md"  // 可选，不提供则自动生成
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "20260307-002",
    "title": "新笔记标题",
    "path": "20260307-002.md",
    "createdAt": "2026-03-07T14:00:00Z"
  },
  "message": "笔记创建成功"
}
```

#### 3.2.4 更新笔记

```http
PUT /api/v1/notes/:id
```

**请求体**:
```json
{
  "title": "更新后的标题",  // 可选
  "content": "更新后的内容",  // 可选
  "path": "new-folder/note.md"  // 可选，移动笔记
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "20260307-001",
    "updatedAt": "2026-03-07T15:00:00Z"
  },
  "message": "笔记更新成功"
}
```

#### 3.2.5 删除笔记

```http
DELETE /api/v1/notes/:id
```

**响应示例**:
```json
{
  "success": true,
  "message": "笔记已删除"
}
```

### 3.3 搜索 API

#### 3.3.1 全文搜索

```http
GET /api/v1/search
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 搜索关键词 |
| `inTitle` | boolean | 否 | 仅搜索标题，默认 false |
| `inContent` | boolean | 否 | 搜索正文内容，默认 true |
| `tags` | string | 否 | 按标签过滤，逗号分隔 |
| `limit` | number | 否 | 返回结果数量，默认 20 |
| `offset` | number | 否 | 分页偏移量，默认 0 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "query": "项目会议",
    "total": 5,
    "results": [
      {
        "id": "20260307-001",
        "title": "项目会议纪要",
        "path": "meetings/20260307-001.md",
        "excerpt": "本周<strong>项目会议</strong>讨论了...",
        "matchScore": 0.95,
        "highlights": [
          {"field": "title", "positions": [[0, 2]]},
          {"field": "content", "positions": [[15, 19]]}
        ]
      }
    ]
  }
}
```

### 3.4 元数据 API

#### 3.4.1 获取统计信息

```http
GET /api/v1/meta/stats
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalNotes": 156,
    "totalFolders": 12,
    "totalWords": 45230,
    "lastUpdated": "2026-03-07T15:30:00Z"
  }
}
```

#### 3.4.2 获取标签列表

```http
GET /api/v1/meta/tags
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "tags": [
      {"name": "会议", "count": 23},
      {"name": "项目", "count": 45},
      {"name": "笔记", "count": 67}
    ]
  }
}
```

### 3.5 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "NOTE_NOT_FOUND",
    "message": "笔记不存在",
    "details": {
      "noteId": "invalid-id"
    }
  }
}
```

**常见错误码**:
| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| `NOTE_NOT_FOUND` | 404 | 笔记不存在 |
| `NOTE_ALREADY_EXISTS` | 409 | 笔记已存在 |
| `INVALID_PATH` | 400 | 路径格式无效 |
| `FILE_WRITE_ERROR` | 500 | 文件写入失败 |
| `SEARCH_ERROR` | 500 | 搜索服务错误 |

---

## 4. 数据格式设计

### 4.1 Markdown 笔记文件格式

每篇笔记存储为独立的 `.md` 文件，采用 Front Matter 格式：

```markdown
---
id: 20260307-001
title: 项目会议纪要
createdAt: 2026-03-07T10:00:00Z
updatedAt: 2026-03-07T11:30:00Z
tags:
  - 会议
  - 项目
  - 2026-Q1
---

# 项目会议纪要

## 基本信息

- **时间**: 2026-03-07 10:00-11:30
- **地点**: 会议室 A
- **参会人**: 张三、李四、王五

## 会议内容

### 1. 项目进度汇报

...

### 2. 问题讨论

...

## 待办事项

- [ ] 完成需求文档
- [ ] 安排下次评审
```

### 4.2 Front Matter 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识符，格式：`YYYYMMDD-NNN` |
| `title` | string | 是 | 笔记标题 |
| `createdAt` | datetime | 是 | 创建时间 (ISO 8601) |
| `updatedAt` | datetime | 是 | 最后更新时间 (ISO 8601) |
| `tags` | string[] | 否 | 标签列表 |
| `folder` | string | 否 | 逻辑分类文件夹 |

### 4.3 MySQL 索引表结构

```sql
-- 笔记元数据表
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    path VARCHAR(1000) UNIQUE NOT NULL,
    content_hash VARCHAR(64),
    word_count INT DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    is_deleted TINYINT DEFAULT 0,
    INDEX idx_notes_updated (updated_at DESC),
    INDEX idx_notes_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 笔记 - 标签关联表
CREATE TABLE IF NOT EXISTS note_tags (
    note_id VARCHAR(50) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文件夹表
CREATE TABLE IF NOT EXISTS folders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    path VARCHAR(1000) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    parent_path VARCHAR(1000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 全文搜索索引表 (使用 MySQL 全文索引)
ALTER TABLE notes ADD FULLTEXT INDEX ft_notes_search (title, content_hash);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);
```

### 4.4 配置文件格式

**应用配置** (`config.json`):
```json
{
  "port": 3000,
  "dataDir": "/app/data",
  "database": {
    "host": "mysql",
    "port": 3306,
    "user": "notebook",
    "password": "${DB_PASSWORD}",
    "database": "notebook"
  },
  "autoSaveInterval": 30000,
  "maxSearchResults": 100,
  "theme": "light"
}
```

**用户偏好** (`preferences.json`):
```json
{
  "editor": {
    "fontSize": 14,
    "lineHeight": 1.6,
    "wordWrap": true,
    "minimap": false,
    "previewOnEdit": false
  },
  "list": {
    "viewMode": "list",
    "sortBy": "updatedAt",
    "sortOrder": "desc",
    "showPreview": true
  },
  "search": {
    "defaultLimit": 20,
    "highlightMatches": true
  }
}
```

### 4.5 文件命名规范

- **笔记文件**: `{id}.md` 或 `{folder}/{id}.md`
- **ID 生成规则**: `YYYYMMDD-NNN` (日期 + 当日序号)
- **文件夹**: 小写字母 + 连字符，如 `meeting-notes`

示例:
```
20260307-001.md
20260307-002.md
meetings/20260307-003.md
projects/notebook/20260307-004.md
```

---

## 5. Docker 部署方案

### 5.1 数据卷映射说明

所有 Docker 数据卷统一映射到 `/home/ubuntu-user/docker` 目录下，便于集中管理和备份：

| 服务 | 容器内路径 | 主机映射路径 | 用途 |
|------|-----------|-------------|------|
| MySQL | `/var/lib/mysql` | `/home/ubuntu-user/docker/notebook/mysql/data` | MySQL 数据文件 |
| App | `/app/data` | `/home/ubuntu-user/docker/notebook/app/data` | 笔记文件和应用数据 |

### 5.2 Docker Compose 配置

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  # MySQL 数据库服务
  mysql:
    image: mysql:8.0
    container_name: notebook-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-notebook_root_2026}
      MYSQL_DATABASE: notebook
      MYSQL_USER: notebook
      MYSQL_PASSWORD: ${DB_PASSWORD:-notebook_user_2026}
    volumes:
      - /home/ubuntu-user/docker/notebook/mysql/data:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - notebook-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 应用服务
  app:
    build:
      context: .
      dockerfile: docker/app/Dockerfile
    container_name: notebook-app
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: notebook
      DB_PASSWORD: ${DB_PASSWORD:-notebook_user_2026}
      DB_NAME: notebook
      DATA_DIR: /app/data
    volumes:
      - /home/ubuntu-user/docker/notebook/app/data:/app/data
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - notebook-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  notebook-network:
    driver: bridge
```

### 5.3 应用 Dockerfile

**docker/app/Dockerfile**:
```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 构建前端
COPY client/ ./client/
COPY vite.config.ts ./
RUN npm run build:client

# 构建后端
COPY server/ ./server/
COPY tsconfig.json ./
RUN npm run build:server

# 生产阶段
FROM node:20-alpine

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/src/config ./server/src/config

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 创建数据目录
RUN mkdir -p /app/data/notes

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server/dist/index.js"]
```

### 5.4 MySQL 初始化脚本

**docker/mysql/init.sql**:
```sql
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS notebook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE notebook;

-- 表结构会在应用启动时自动创建
-- 这里可以放置初始数据或特殊配置
```

### 5.5 环境变量配置

**.env.example**:
```bash
# 应用配置
NODE_ENV=production
PORT=3000

# MySQL 配置
MYSQL_ROOT_PASSWORD=your_secure_root_password_here
DB_PASSWORD=your_secure_user_password_here
DB_HOST=mysql
DB_PORT=3306
DB_USER=notebook
DB_NAME=notebook

# 数据目录
DATA_DIR=/app/data
```

### 5.6 Docker 忽略文件

**.dockerignore**:
```
node_modules
npm-debug.log
.git
.gitignore
*.md
.env
.env.local
dist
build
coverage
.DS_Store
Thumbs.db
*.log
tests
```

### 5.7 部署命令

#### 开发环境
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重建并启动
docker-compose up -d --build
```

#### 生产环境
```bash
# 使用生产环境配置启动
docker-compose -f docker-compose.yml up -d

# 查看服务状态
docker-compose ps

# 进入应用容器
docker-compose exec app sh

# 进入 MySQL 容器
docker-compose exec mysql mysql -u notebook -p notebook
```

### 5.8 多项目管理扩展

为支持将来多项目管理，采用以下策略：

1. **数据库隔离**: 每个项目使用独立的数据库
   ```yaml
   # 多项目 docker-compose 示例
   services:
     mysql-project-a:
       container_name: project-a-mysql
       environment:
         MYSQL_DATABASE: project_a
   
     app-project-a:
       container_name: project-a-app
       environment:
         DB_NAME: project_a
   ```

2. **网络隔离**: 每个项目使用独立的 Docker 网络
   ```yaml
   networks:
     project-a-network:
       driver: bridge
     project-b-network:
       driver: bridge
   ```

3. **数据卷隔离**: 每个项目使用独立的数据卷
   ```yaml
   volumes:
     project-a-data:
     project-b-data:
   ```

4. **端口映射**: 通过不同端口区分项目
   ```yaml
   ports:
     - "3001:3000"  # Project A
     - "3002:3000"  # Project B
   ```

---

## 6. 开发计划

### Phase 1 - 核心功能 (2 周)
- [ ] 项目初始化与基础架构搭建
- [ ] 笔记 CRUD 基础功能
- [ ] Markdown 编辑器集成
- [ ] 本地文件存储
- [ ] Docker 环境配置

### Phase 2 - 搜索与优化 (1 周)
- [ ] 全文搜索功能
- [ ] 搜索索引构建
- [ ] 搜索结果高亮
- [ ] MySQL 数据库集成

### Phase 3 - UI/UX 完善 (1 周)
- [ ] 响应式设计
- [ ] 笔记列表优化
- [ ] 自动保存功能

### Phase 4 - 高级功能 (1 周)
- [ ] 标签管理
- [ ] 文件夹组织
- [ ] 导出功能
- [ ] Docker 生产部署

---

## 7. 技术决策记录

### 7.1 为什么从 SQLite 改为 MySQL？

**决策**: 使用 MySQL 8 替代 SQLite 作为索引数据库

**理由**:
1. **多项目支持**: MySQL 支持多数据库实例，便于未来多项目管理
2. **Docker 友好**: MySQL 官方 Docker 镜像成熟稳定，易于部署和管理
3. **扩展性**: 支持更大规模数据和高并发场景
4. **标准化**: 生产级数据库，便于团队协作和运维
5. **功能丰富**: 支持更复杂的查询和索引优化

### 7.2 为什么选择 Docker 部署？

**决策**: 使用 Docker Compose 进行容器化部署

**理由**:
1. **环境一致性**: 开发、测试、生产环境完全一致
2. **简化部署**: 一键启动所有依赖服务
3. **隔离性**: 应用与数据库隔离，互不影响
4. **可扩展性**: 便于水平扩展和资源管理
5. **版本控制**: Dockerfile 和 docker-compose.yml 可纳入版本管理

### 7.3 为什么保留本地文件存储？

**决策**: 笔记内容仍存储为 Markdown 文件

**理由**:
1. 用户数据完全可控，便于备份和版本管理
2. Markdown 格式通用，可被其他工具读取
3. 支持 Git 版本控制
4. MySQL 仅用于索引和元数据，保证查询性能

### 7.4 为什么选择 flexsearch 而非 Elasticsearch？

**决策**: 使用 flexsearch 进行全文搜索

**理由**:
1. 轻量级，无需额外服务部署
2. 支持中文分词
3. 对于万级文档量性能足够
4. 降低系统复杂度

### 7.5 为什么选择 Monaco Editor？

**决策**: 使用 @monaco-editor/react

**理由**:
1. VS Code 同款编辑器，功能强大
2. 优秀的 Markdown 语法高亮
3. 支持代码折叠、多光标等高级功能
4. 社区活跃，维护良好

---

## 附录

### A. 依赖清单

**前端核心依赖**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@monaco-editor/react": "^4.6.0",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0"
  }
}
```

**后端核心依赖**:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.9.0",
    "chokidar": "^3.6.0",
    "flexsearch": "^0.7.43",
    "cors": "^2.8.5",
    "front-matter": "^4.0.2"
  }
}
```

### B. 环境变量

```bash
# .env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=notebook
DB_PASSWORD=notebook_dev_password
DB_NAME=notebook
DATA_DIR=/home/ubuntu-user/.openclaw/project/notebook/server/data
```

### C. 常用 Docker 命令

```bash
# 查看容器状态
docker-compose ps

# 查看应用日志
docker-compose logs app

# 查看数据库日志
docker-compose logs mysql

# 进入应用容器
docker-compose exec app sh

# 进入 MySQL 容器
docker-compose exec mysql mysql -u notebook -p notebook

# 备份数据库
docker-compose exec mysql mysqldump -u notebook -p notebook > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u notebook -p notebook < backup.sql

# 清理未使用的卷
docker volume prune

# 重建容器
docker-compose up -d --force-recreate
```

---

*文档结束*
