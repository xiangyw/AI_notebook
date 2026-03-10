# Notebook 项目快速启动指南

## 🚀 快速开始

### 1. 启动前端开发服务器

```bash
cd /home/ubuntu-user/.openclaw/project/notebook/client
npm install
npm run dev
```

访问 http://localhost:5173 查看应用

### 2. 构建生产版本

```bash
cd /home/ubuntu-user/.openclaw/project/notebook/client
npm run build
```

构建产物在 `dist/` 目录

---

## 📁 项目结构

```
notebook/
├── client/                 # 前端客户端
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── stores/        # 状态管理
│   │   ├── services/      # API 服务
│   │   ├── types/         # TypeScript 类型
│   │   └── styles/        # 样式
│   ├── package.json
│   └── README.md
├── server/                # 后端服务器（待实现）
└── docs/                  # 文档
    ├── design/           # 设计文档
    └── IMPLEMENTATION_PHASE1.md
```

---

## 🎯 Phase 1 完成情况

✅ **核心界面已完成**

- [x] 三栏布局（顶部导航 + 左侧边栏 + 主编辑区）
- [x] 底部状态栏
- [x] 笔记列表（标题、时间、预览、选中高亮）
- [x] 文件夹树形结构
- [x] Monaco Editor 集成
- [x] Markdown 实时预览
- [x] 编辑/预览分栏切换
- [x] 编辑器工具栏
- [x] 搜索组件（实时搜索、结果高亮）
- [x] 状态管理（Zustand）
- [x] API 服务层（Axios 封装）

---

## 🎨 功能演示

### 主界面
- 顶部导航栏：Logo、搜索框、新建按钮、暗黑模式切换
- 左侧边栏：文件夹导航、笔记列表
- 主编辑区：标题输入、编辑器工具栏、Markdown 编辑/预览
- 底部状态栏：统计信息、保存状态、模式切换

### 编辑器功能
- **编辑模式**：仅显示 Monaco 编辑器
- **分栏模式**：左侧编辑，右侧实时预览
- **预览模式**：仅显示渲染后的 Markdown

### 搜索功能
- 顶部搜索框实时搜索
- 支持标题和内容搜索
- 下拉显示搜索结果（最多 5 条）

### 笔记管理
- 创建新笔记
- 删除笔记（带确认）
- 按文件夹筛选
- 收藏夹支持

---

## 🛠️ 技术栈

- **前端框架：** React 18 + TypeScript
- **构建工具：** Vite 5
- **样式：** Tailwind CSS 3
- **状态管理：** Zustand 4
- **编辑器：** Monaco Editor
- **HTTP 客户端：** Axios

---

## 📝 使用说明

### 创建笔记
1. 点击顶部导航栏的"+ 新建"按钮
2. 输入笔记标题和内容
3. 自动保存

### 编辑笔记
1. 从左侧列表选择笔记
2. 在编辑器中修改内容
3. 使用工具栏快速插入 Markdown 语法

### 搜索笔记
1. 在顶部搜索框输入关键词
2. 实时显示搜索结果
3. 点击搜索结果快速定位

### 切换编辑模式
- 点击编辑器下方的"编辑"、"分栏"、"预览"按钮

### 暗黑模式
- 点击顶部导航栏或底部状态栏的月亮/太阳图标

---

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

---

## 📄 相关文档

- [设计系统](./docs/design/design-system.md)
- [界面原型](./docs/design/ui-mockup.md)
- [Tailwind 配置](./docs/design/tailwind-config.md)
- [Phase 1 实现报告](./docs/IMPLEMENTATION_PHASE1.md)
- [客户端 README](./client/README.md)

---

## 🚧 下一步计划

详见 [Phase 2 计划](./docs/IMPLEMENTATION_PHASE1.md#-下一步计划 phase-2)

---

*最后更新：2026-03-07*
