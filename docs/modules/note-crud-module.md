# 笔记 CRUD 模块文档

**负责人**: DEV Chenwenlong  
**状态**: ✅ 已完成  
**最后更新**: 2026-03-07

---

## 模块概述

负责笔记文件的核心 CRUD 操作，包括：
- 笔记文件读写
- Front Matter 解析
- 笔记元数据管理
- CRUD API 端点

---

## 文件结构

```
server/src/
├── services/
│   └── noteService.ts      # 核心业务逻辑
├── routes/
│   └── notes.ts            # API 路由
└── types/
    └── index.ts            # 类型定义
```

---

## 核心功能

### 1. Front Matter 解析

支持标准 YAML Front Matter 格式：

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

### 2. ID 生成规则

格式：`YYYYMMDD-NNN`
- `YYYYMMDD`: 日期
- `NNN`: 当日序号（000-999）

### 3. 文件存储

- 根目录：`server/data/notes/`
- 支持子目录：`server/data/notes/folder/note.md`
- 编码：UTF-8

---

## API 端点

### 笔记管理

| 方法 | 端点 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/notes` | 获取笔记列表 | ✅ |
| GET | `/api/notes/:id` | 获取单篇笔记 | ✅ |
| POST | `/api/notes` | 创建笔记 | ✅ |
| PUT | `/api/notes/:id` | 更新笔记 | ✅ |
| DELETE | `/api/notes/:id` | 删除笔记 | ✅ |

### 请求/响应示例

#### 创建笔记
```bash
POST /api/notes
Content-Type: application/json

{
  "title": "笔记标题",
  "content": "笔记内容",
  "path": "folder/note.md",  // 可选
  "tags": ["标签 1", "标签 2"]  // 可选
}
```

```json
{
  "success": true,
  "data": {
    "id": "20260307-001",
    "title": "笔记标题",
    "content": "笔记内容",
    "path": "folder/note.md",
    "tags": ["标签 1", "标签 2"],
    "createdAt": "2026-03-07T10:00:00Z",
    "updatedAt": "2026-03-07T10:00:00Z",
    "wordCount": 100
  },
  "message": "笔记创建成功"
}
```

#### 获取笔记
```bash
GET /api/notes/20260307-001
```

```json
{
  "success": true,
  "data": {
    "id": "20260307-001",
    "title": "笔记标题",
    "content": "笔记内容",
    "path": "folder/note.md",
    "tags": ["标签 1", "标签 2"],
    "createdAt": "2026-03-07T10:00:00Z",
    "updatedAt": "2026-03-07T10:00:00Z",
    "wordCount": 100
  }
}
```

#### 更新笔记
```bash
PUT /api/notes/20260307-001
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "tags": ["新标签"]
}
```

#### 删除笔记
```bash
DELETE /api/notes/20260307-001
```

```json
{
  "success": true,
  "data": {
    "message": "笔记已删除"
  }
}
```

---

## 类型定义

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  path: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
}

interface CreateNoteInput {
  title: string;
  content: string;
  path?: string;
  tags?: string[];
}

interface UpdateNoteInput {
  title?: string;
  content?: string;
  path?: string;
  tags?: string[];
}
```

---

## 测试状态

### 单元测试
- [ ] 创建笔记测试
- [ ] 读取笔记测试
- [ ] 更新笔记测试
- [ ] 删除笔记测试
- [ ] Front Matter 解析测试

### 集成测试
- [x] API 端点测试（curl）
- [x] 文件创建验证
- [x] 文件更新验证
- [x] 文件删除验证

---

## 性能指标

| 操作 | 平均耗时 | 备注 |
|------|---------|------|
| 创建笔记 | <10ms | 包含文件写入 |
| 读取笔记 | <5ms | 包含文件读取和解析 |
| 更新笔记 | <10ms | 包含文件重写 |
| 删除笔记 | <5ms | 文件删除 |

---

## 已知问题

无

---

## 与其他模块的接口

### 输入
- 无（独立模块）

### 输出
- 笔记文件（`.md` 格式）
- 笔记元数据（通过 API）

### 依赖模块
- 文件服务模块（文件监控）

---

## 更新日志

### 2026-03-07
- ✅ 完成核心 CRUD 功能
- ✅ 实现 Front Matter 解析
- ✅ 完成 API 端点
- ✅ 通过集成测试
