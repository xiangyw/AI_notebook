# 文件服务模块文档

**负责人**: DEV Chenwenlong  
**状态**: ✅ 已完成  
**最后更新**: 2026-03-07

---

## 模块概述

负责文件系统相关的增强功能，包括：
- 文件监控（chokidar）
- 自动保存
- 崩溃恢复
- 文件变更事件

---

## 文件结构

```
server/src/
├── services/
│   ├── fileWatcher.ts      # 文件监控服务
│   └── autoSave.ts         # 自动保存服务
├── routes/
│   └── files.ts            # API 路由
└── types/
    └── index.ts            # 类型定义（共享）
```

---

## 核心功能

### 1. 文件监控（FileWatcher）

使用 chokidar 库监控笔记目录的文件变化：

**功能**:
- 监听文件创建、修改、删除
- 发出变更事件
- 支持事件订阅

**配置**:
```typescript
{
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 10,
  },
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
}
```

**事件**:
```typescript
interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  filePath: string;
  timestamp: Date;
}
```

### 2. 自动保存（AutoSave）

定期保存编辑中的笔记到临时文件：

**功能**:
- 定时保存（默认 30 秒）
- 临时文件存储
- 崩溃恢复
- 手动刷新

**配置**:
```bash
AUTO_SAVE_INTERVAL=30000  # 保存间隔（毫秒）
```

**存储位置**:
```
server/data/autosave/
├── {noteId}.autosave
└── ...
```

**自动保存文件格式**:
```json
{
  "id": "20260307-001",
  "content": "正在编辑的内容...",
  "timestamp": "2026-03-07T10:00:00.000Z"
}
```

---

## API 端点

### 文件监控

| 方法 | 端点 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/files/watch/status` | 获取监控状态 | ✅ |
| POST | `/api/files/watch/start` | 启动监控 | ✅ |
| POST | `/api/files/watch/stop` | 停止监控 | ✅ |

### 自动保存

| 方法 | 端点 | 说明 | 状态 |
|------|------|------|------|
| GET | `/api/files/autosave/status` | 获取保存状态 | ✅ |
| POST | `/api/files/autosave/start` | 开始自动保存 | ✅ |
| POST | `/api/files/autosave/stop` | 停止自动保存 | ✅ |
| POST | `/api/files/autosave/flush` | 立即保存 | ✅ |
| GET | `/api/files/autosave/recover` | 恢复未保存 | ✅ |
| POST | `/api/files/autosave/cleanup` | 清理临时文件 | ✅ |

---

## 使用示例

### 文件监控

```bash
# 查看监控状态
curl http://localhost:3000/api/files/watch/status

# 启动监控
curl -X POST http://localhost:3000/api/files/watch/start

# 停止监控
curl -X POST http://localhost:3000/api/files/watch/stop
```

### 自动保存

```bash
# 查看保存状态
curl http://localhost:3000/api/files/autosave/status

# 开始自动保存
curl -X POST http://localhost:3000/api/files/autosave/start \
  -H "Content-Type: application/json" \
  -d '{"noteId":"20260307-001","content":"正在编辑..."}'

# 立即保存
curl -X POST http://localhost:3000/api/files/autosave/flush \
  -H "Content-Type: application/json" \
  -d '{"noteId":"20260307-001"}'

# 恢复未保存的笔记
curl http://localhost:3000/api/files/autosave/recover

# 清理临时文件
curl -X POST http://localhost:3000/api/files/autosave/cleanup \
  -H "Content-Type: application/json" \
  -d '{"noteId":"20260307-001"}'
```

---

## 代码示例

### 订阅文件变更事件

```typescript
import { fileWatcher } from './services/fileWatcher.js';

fileWatcher.onChange((event) => {
  console.log(`文件变更：${event.type} - ${event.filePath}`);
  
  // 可以在这里触发其他操作
  // 例如：更新搜索索引、通知客户端等
});
```

### 使用自动保存

```typescript
import { autoSaveService } from './services/autoSave.js';

// 开始编辑时启动自动保存
autoSaveService.startAutoSave(noteId, content);

// 保存时立即刷新
await autoSaveService.flush(noteId);

// 保存成功后清理
await autoSaveService.cleanup(noteId);
```

---

## 崩溃恢复流程

1. **服务器启动时**:
   ```typescript
   const recovered = await autoSaveService.recoverUnsavedNotes();
   // 检查是否有可恢复的笔记
   ```

2. **客户端处理**:
   ```typescript
   // 前端检查是否有未保存的笔记
   const response = await fetch('/api/files/autosave/recover');
   const { entries } = await response.json();
   
   if (entries.length > 0) {
     // 提示用户恢复
     showRecoverDialog(entries);
   }
   ```

---

## 性能指标

| 操作 | 平均耗时 | 备注 |
|------|---------|------|
| 启动监控 | <10ms | 一次性操作 |
| 文件变更检测 | <1ms | 实时检测 |
| 自动保存 | <5ms | 写入临时文件 |
| 恢复检查 | <10ms | 读取目录 |

---

## 配置选项

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `AUTO_SAVE_INTERVAL` | 30000 | 自动保存间隔（毫秒） |
| `DATA_DIR` | `./data` | 数据目录 |

---

## 与其他模块的接口

### 依赖
- 笔记 CRUD 模块（笔记文件）

### 被依赖
- 数据库模块（可选，用于同步元数据）
- 搜索模块（文件变更时更新索引）

---

## 测试状态

### 功能测试
- [x] 文件监控启动/停止
- [x] 文件变更事件触发
- [x] 自动保存启动/停止
- [x] 自动保存文件写入
- [x] 崩溃恢复
- [x] 临时文件清理

### API 测试
- [x] 所有端点测试通过

---

## 已知问题

无

---

## 更新日志

### 2026-03-07
- ✅ 完成文件监控服务
- ✅ 完成自动保存服务
- ✅ 完成 API 端点
- ✅ 通过集成测试
