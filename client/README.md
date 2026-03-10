# Notebook Client

Notebook 应用的前端客户端，基于 React + TypeScript + Vite 构建。

## 🚀 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **Monaco Editor** - 代码编辑器
- **Axios** - HTTP 客户端

## 📦 安装

```bash
npm install
```

## 🛠️ 开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── TopNav/         # 顶部导航栏
│   ├── StatusBar/      # 底部状态栏
│   ├── SearchBar/      # 搜索框
│   ├── FolderTree/     # 文件夹树
│   ├── NoteList/       # 笔记列表
│   └── Editor/         # 编辑器组件
│       ├── Editor.tsx          # 主编辑器
│       ├── EditorToolbar.tsx   # 工具栏
│       └── MarkdownPreview.tsx # Markdown 预览
├── stores/             # Zustand 状态管理
│   └── noteStore.ts    # 笔记状态
├── services/           # API 服务
│   └── api.ts          # API 封装
├── types/              # TypeScript 类型定义
│   └── index.ts
├── hooks/              # 自定义 Hooks
├── styles/             # 样式文件
│   └── index.css
├── App.tsx             # 主应用组件
└── main.tsx            # 入口文件
```

## 🎨 功能特性

### Phase 1 - 核心界面 ✅

- [x] **主布局**
  - [x] 三栏布局（顶部导航 + 左侧边栏 + 主编辑区）
  - [x] 底部状态栏
  - [x] 响应式适配

- [x] **笔记列表组件**
  - [x] 显示笔记列表（标题、时间、预览）
  - [x] 选中状态高亮
  - [x] 新建笔记按钮
  - [x] 文件夹树形结构

- [x] **编辑器组件**
  - [x] Monaco Editor 集成
  - [x] 实时预览（markdown 渲染）
  - [x] 编辑/预览分栏切换
  - [x] 工具栏（加粗、斜体、标题等快捷按钮）

- [x] **搜索组件**
  - [x] 顶部搜索框
  - [x] 实时搜索
  - [x] 搜索结果高亮

- [x] **状态管理**
  - [x] 笔记列表状态
  - [x] 当前编辑笔记
  - [x] 保存状态
  - [x] UI 状态（主题、边栏折叠等）

- [x] **API 服务层**
  - [x] Axios 封装
  - [x] 请求/响应拦截器
  - [x] 笔记 CRUD 接口（预留）
  - [x] 文件夹 CRUD 接口（预留）

### Phase 2 - 待实现

- [ ] 后端 API 对接
- [ ] 用户认证
- [ ] 笔记同步
- [ ] 文件夹管理
- [ ] 标签系统
- [ ] 笔记导出（PDF、Markdown）
- [ ] 暗黑模式完善
- [ ] 快捷键支持
- [ ] 笔记历史版本

## 🎯 设计规范

参考设计文档：
- [设计系统](../docs/design/design-system.md)
- [界面原型](../docs/design/ui-mockup.md)
- [Tailwind 配置](../docs/design/tailwind-config.md)

## 🌐 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Notebook
VITE_APP_VERSION=0.1.0
```

## 📝 使用说明

### 创建笔记

1. 点击顶部导航栏的"+ 新建"按钮
2. 或从侧边栏选择文件夹后创建

### 编辑笔记

1. 从左侧笔记列表选择笔记
2. 在编辑器中编写内容
3. 支持 Markdown 语法
4. 自动保存

### 搜索笔记

1. 在顶部搜索框输入关键词
2. 实时显示搜索结果
3. 支持标题和内容搜索

### 切换编辑模式

- **编辑模式**：仅显示编辑器
- **分栏模式**：左侧编辑，右侧预览
- **预览模式**：仅显示渲染后的 Markdown

## 🤝 贡献

请参考项目的贡献指南。

## 📄 许可证

MIT
