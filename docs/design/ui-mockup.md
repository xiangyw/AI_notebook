# Notebook 界面原型图

> 三栏式布局：侧边栏 + 主编辑区 + 状态栏

---

## 📐 整体布局 ASCII 图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TOP NAVIGATION BAR (高度：56px / h-14)                                          │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ 📒 Notebook    [🔍 搜索笔记...]                    [+ 新建] [⚙️ 设置]      │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
├────────────────────┬────────────────────────────────────────────────────────────┤
│                    │                                                            │
│  SIDEBAR           │  MAIN EDITOR AREA                                          │
│  (宽度：280px)     │  (flex-1, 剩余空间)                                        │
│                    │                                                            │
│  ┌──────────────┐  │  ┌────────────────────────────────┬─────────────────────┐  │
│  │ 📝 全部笔记  │  │  │  EDITOR PANE                  │  PREVIEW PANE       │  │
│  │ 📁 工作      │  │  │  (flex-1)                     │  (flex-1)           │  │
│  │ 📁 个人      │  │  │                                 │                     │  │
│  │ 📁 学习      │  │  │  # 笔记标题                    │  [渲染后的 Markdown] │  │
│  │ ⭐ 收藏夹    │  │  │                                 │                     │  │
│  │ 🗑️ 回收站    │  │  │  正文内容...                   │  • 实时预览         │  │
│  └──────────────┘  │  │                                 │  • 语法高亮         │  │
│                    │  │                                 │  • 目录导航         │  │
│  ────────────────  │  │                                 │                     │  │
│                    │  │  [工具栏：B I H 🔗 📷 ]        │                     │  │
│  笔记列表:         │  │                                 │                     │  │
│                    │  └────────────────────────────────┴─────────────────────┘  │
│  ● 项目会议记录   │                                                            │
│    2 小时前       │                                                            │
│  ● 学习笔记 - React │                                                            │
│    昨天           │                                                            │
│  ● 购物清单       │                                                            │
│    3 天前         │                                                            │
│  ● 想法随笔       │                                                            │
│    1 周前         │                                                            │
│                    │                                                            │
│  [...更多]        │                                                            │
│                    │                                                            │
├────────────────────┴────────────────────────────────────────────────────────────┤
│  STATUS BAR (高度：32px / h-8)                                                   │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ 📊 3 笔记  |  1,234 字  |  ✅ 已保存 (刚刚)              [🌙 夜间模式]    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧭 各组件位置说明

### 1. 顶部导航栏 (Top Navigation Bar)

**位置**: 页面顶部，固定定位
**高度**: 56px (`h-14`)
**背景**: `bg-white border-b border-gray-200`

**内容从左到右**:

| 元素 | 位置 | 样式 | 功能 |
|------|------|------|------|
| Logo | 左侧，pl-4 | `text-xl font-bold text-sky-600` | 品牌标识，点击返回首页 |
| 搜索框 | 左侧，ml-4 | `w-64` | 全局搜索笔记 |
| 功能按钮组 | 右侧，pr-4 | `flex gap-2` | 新建、设置等操作 |

**结构**:
```html
<header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
  <div class="flex items-center gap-4">
    <span class="text-xl font-bold text-sky-600">📒 Notebook</span>
    <input type="text" placeholder="🔍 搜索笔记..." class="..." />
  </div>
  <div class="flex items-center gap-2">
    <button>+ 新建</button>
    <button>⚙️</button>
  </div>
</header>
```

---

### 2. 左侧边栏 (Sidebar)

**位置**: 页面左侧，固定宽度
**宽度**: 280px
**背景**: `bg-gray-50 border-r border-gray-200`

**分区**:

#### 2.1 分类导航区 (顶部)
```html
<nav class="p-4 space-y-1">
  <a class="notebook-nav-item active">📝 全部笔记</a>
  <a class="notebook-nav-item">📁 工作</a>
  <a class="notebook-nav-item">📁 个人</a>
  <a class="notebook-nav-item">📁 学习</a>
  <a class="notebook-nav-item">⭐ 收藏夹</a>
  <a class="notebook-nav-item">🗑️ 回收站</a>
</nav>
```

#### 2.2 笔记列表区 (主体)
```html
<div class="flex-1 overflow-y-auto p-2">
  <div class="note-item">
    <div class="indicator"></div>
    <div class="content">
      <h3 class="title">笔记标题</h3>
      <p class="meta">最后编辑时间</p>
    </div>
  </div>
  <!-- 更多笔记项 -->
</div>
```

---

### 3. 主编辑区 (Main Editor Area)

**位置**: 页面中央，占据剩余空间
**布局**: `flex-1 flex flex-col`

#### 3.1 编辑/预览分栏

**容器**:
```html
<div class="flex-1 flex overflow-hidden">
  <!-- 编辑区 -->
  <div class="flex-1 border-r border-gray-200 overflow-y-auto">
    <!-- Markdown 编辑器 -->
  </div>
  <!-- 预览区 -->
  <div class="flex-1 overflow-y-auto bg-gray-50">
    <!-- 渲染后的 HTML -->
  </div>
</div>
```

**编辑器工具栏**:
```html
<div class="h-10 border-b border-gray-200 flex items-center gap-1 px-2">
  <button title="加粗"><strong>B</strong></button>
  <button title="斜体"><em>I</em></button>
  <button title="标题">H</button>
  <button title="链接">🔗</button>
  <button title="图片">📷</button>
  <button title="列表">☰</button>
  <button title="代码">&lt;/&gt;</button>
</div>
```

---

### 4. 底部状态栏 (Status Bar)

**位置**: 页面底部，固定定位
**高度**: 32px (`h-8`)
**背景**: `bg-gray-100 border-t border-gray-200`

**内容**:
```html
<footer class="h-8 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-500">
  <div class="flex items-center gap-4">
    <span>📊 3 笔记</span>
    <span>1,234 字</span>
    <span>✅ 已保存 (刚刚)</span>
  </div>
  <div class="flex items-center gap-2">
    <button>🌙 夜间模式</button>
  </div>
</footer>
```

---

## 🎮 交互状态说明

### 按钮交互状态

#### 主按钮 (Primary Button)

```css
/* Default */
.bg-sky-500.text-white

/* Hover */
:hover {
  background-color: #0284c7; /* sky-600 */
  transform: translateY(-1px);
}

/* Active */
:active {
  background-color: #0369a1; /* sky-700 */
  transform: translateY(0);
}

/* Disabled */
:disabled {
  background-color: #d4d4d8; /* gray-300 */
  color: #a1a1aa; /* gray-400 */
  cursor: not-allowed;
  transform: none;
}

/* Focus */
:focus-visible {
  outline: none;
  ring: 2px solid #0ea5e9; /* sky-500 */
  ring-offset: 2px;
}
```

#### 次级按钮 (Secondary Button)

```css
/* Default */
.border.border-gray-300.text-gray-700.bg-white

/* Hover */
:hover {
  background-color: #f9fafb; /* gray-50 */
  border-color: #d4d4d8; /* gray-300 */
}

/* Active */
:active {
  background-color: #f3f4f6; /* gray-100 */
}

/* Disabled */
:disabled {
  border-color: #e5e7eb; /* gray-200 */
  color: #9ca3af; /* gray-400 */
  cursor: not-allowed;
}
```

---

### 笔记列表项交互

```css
/* Default */
.hover:bg-gray-100.cursor-pointer

/* Hover */
:hover {
  background-color: #f4f4f5; /* gray-100 */
}

/* Active (选中) */
.active, &.selected {
  background-color: #e0f2fe; /* sky-100 */
  border-left: 3px solid #0ea5e9; /* sky-500 */
}

/* Active (点击中) */
:active {
  background-color: #e4e4e7; /* gray-200 */
}
```

---

### 输入框交互

```css
/* Default */
.border.border-gray-300

/* Focus */
:focus {
  outline: none;
  border-color: #0ea5e9; /* sky-500 */
  ring: 2px solid #0ea5e9;
  ring-offset: 2px;
}

/* Disabled */
:disabled {
  background-color: #f4f4f5; /* gray-100 */
  color: #9ca3af; /* gray-400 */
  cursor: not-allowed;
}

/* Error */
.error {
  border-color: #ef4444; /* red-500 */
  &:focus {
    ring-color: #ef4444;
  }
}
```

---

### 导航项交互

```css
/* Default */
.text-gray-600.hover:bg-gray-100

/* Hover */
:hover {
  background-color: #f4f4f5; /* gray-100 */
  color: #3f3f46; /* gray-700 */
}

/* Active (当前页面) */
.active {
  background-color: #e0f2fe; /* sky-100 */
  color: #0369a1; /* sky-700 */
  font-weight: 500;
}
```

---

### 编辑器工具栏按钮

```css
/* Default */
.p-2.rounded.hover:bg-gray-100

/* Hover */
:hover {
  background-color: #f4f4f5; /* gray-100 */
}

/* Active (功能激活) */
.active {
  background-color: #e0f2fe; /* sky-100 */
  color: #0369a1; /* sky-700 */
}

/* Disabled */
:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 📱 响应式布局说明

### 桌面端 (> 1024px)

```
┌─────────────────────────────────────────┐
│  Top Nav (56px)                         │
├───────────┬─────────────────────────────┤
│ Sidebar   │  Main Editor                │
│ (280px)   │  ┌──────────┬────────────┐ │
│           │  │ Editor   │  Preview   │ │
│           │  │ (50%)    │  (50%)     │ │
│           │  └──────────┴────────────┘ │
├───────────┴─────────────────────────────┤
│  Status Bar (32px)                      │
└─────────────────────────────────────────┘
```

### 平板端 (768px - 1024px)

```
┌─────────────────────────────────┐
│  Top Nav (56px)                 │
├─────────┬───────────────────────┤
│ Sidebar │  Main Editor          │
│ (折叠)  │  (可切换编辑/预览)    │
│         │                       │
├─────────┴───────────────────────┤
│  Status Bar (32px)              │
└─────────────────────────────────┘
```

### 移动端 (< 768px)

```
┌─────────────────────┐
│  Top Nav (56px)     │
│  [☰] Notebook  [🔍] │
├─────────────────────┤
│  Main Editor        │
│  (全屏编辑)         │
│                     │
│  [切换预览]         │
├─────────────────────┤
│  Status Bar (32px)  │
└─────────────────────┘

* 侧边栏通过汉堡菜单弹出
* 编辑/预览通过 Tab 切换
```

---

## 🎬 动画效果

### 页面加载动画

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

### 侧边栏展开/收起

```css
.sidebar-transition {
  transition: width 0.3s ease-in-out, transform 0.3s ease-in-out;
}

/* 收起状态 */
.sidebar-collapsed {
  width: 64px;
}

/* 移动端弹出 */
.sidebar-mobile {
  transform: translateX(-100%);
}
.sidebar-mobile.open {
  transform: translateX(0);
}
```

### 保存状态提示

```css
@keyframes pulse-success {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.save-indicator {
  animation: pulse-success 2s ease-in-out;
}
```

---

## 🧪 组件状态示例

### 空状态 (Empty State)

```
┌─────────────────────────────────┐
│                                 │
│         📝                      │
│                                 │
│     还没有笔记                  │
│                                 │
│   点击右上角"+新建"             │
│   创建你的第一篇笔记            │
│                                 │
│     [+ 新建笔记]                │
│                                 │
└─────────────────────────────────┘
```

### 加载状态 (Loading State)

```html
<div class="space-y-3">
  <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
  <div class="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
  <div class="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
</div>
```

### 错误状态 (Error State)

```
┌─────────────────────────────────┐
│  ⚠️  加载失败                   │
│                                 │
│  无法连接到服务器，请检查网络   │
│                                 │
│  [🔄 重试]  [📞 联系支持]       │
└─────────────────────────────────┘
```

---

*最后更新：2026-03-07*
