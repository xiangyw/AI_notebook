# Notebook Server - 后端服务

基于 Express + TypeScript 的笔记管理后端服务。

## 功能特性

### 核心功能
- ✅ 笔记 CRUD 操作（创建、读取、更新、删除）
- ✅ Front Matter 解析（YAML 元数据 + Markdown 正文）
- ✅ 文件系统存储（.md 文件）
- ✅ 全文搜索（标题和标签）
- ✅ 统计信息 API
- ✅ 标签管理
- ✅ 文件夹组织

### 技术特性
- ✅ TypeScript 5
- ✅ Express 4
- ✅ CORS 支持
- ✅ 错误处理中间件
- ✅ 请求日志
- ✅ 优雅关闭

## API 端点

### 笔记管理
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/notes` | 获取笔记列表 |
| GET | `/api/notes/:id` | 获取单篇笔记 |
| POST | `/api/notes` | 创建笔记 |
| PUT | `/api/notes/:id` | 更新笔记 |
| DELETE | `/api/notes/:id` | 删除笔记 |

### 搜索
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/search?q=关键词` | 全文搜索 |
| POST | `/api/search/rebuild` | 重建搜索索引 |

### 元数据
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/meta/stats` | 统计信息 |
| GET | `/api/meta/tags` | 标签列表 |
| GET | `/api/meta/folders` | 文件夹列表 |
| GET | `/api/meta/tags/:name` | 单个标签信息 |

### 其他
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api` | API 文档 |

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3000 | 服务器端口 |
| `NODE_ENV` | development | 运行环境 |
| `DATA_DIR` | `./data` | 数据目录 |
| `DB_HOST` | localhost | MySQL 主机（可选） |
| `DB_PORT` | 3306 | MySQL 端口 |
| `DB_USER` | root | MySQL 用户 |
| `DB_PASSWORD` | - | MySQL 密码 |
| `DB_NAME` | notebook | MySQL 数据库名 |

## 笔记文件格式

使用 Front Matter 格式存储元数据：

```markdown
---
id: 20260307-001
title: 笔记标题
createdAt: 2026-03-07T10:00:00Z
updatedAt: 2026-03-07T11:30:00Z
tags:
  - 标签 1
  - 标签 2
---

# 笔记正文

Markdown 内容...
```

## 运行模式

### 文件系统模式（默认）
- 所有笔记存储为 `.md` 文件
- 无需数据库
- 适合个人使用和本地开发

### 数据库模式（待启用）
- 需要 MySQL 8.0+
- 使用 Docker Compose 部署
- 支持多用户和高级功能

## 测试示例

```bash
# 健康检查
curl http://localhost:3000/health

# 创建笔记
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"测试","content":"内容","tags":["测试"]}'

# 获取笔记列表
curl http://localhost:3000/api/notes

# 搜索
curl "http://localhost:3000/api/search?q=测试"

# 统计信息
curl http://localhost:3000/api/meta/stats
```

## 项目结构

```
server/
├── src/
│   ├── index.ts          # 入口文件
│   ├── app.ts            # Express 应用
│   ├── config/           # 配置管理
│   ├── routes/           # API 路由
│   │   ├── notes.ts
│   │   ├── search.ts
│   │   └── meta.ts
│   ├── services/         # 业务逻辑
│   │   ├── noteService.ts
│   │   ├── searchService.ts
│   │   └── metaService.ts
│   ├── middleware/       # 中间件
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── database/         # 数据库（可选）
│   └── types/            # 类型定义
├── data/                 # 数据目录
│   └── notes/            # 笔记文件
└── dist/                 # 编译输出
```

## 许可证

MIT
