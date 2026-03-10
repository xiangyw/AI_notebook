# Notebook 设计系统

> 简洁、专注、高效的笔记应用设计语言

---

## 🎨 配色方案

### 主色 (Primary)

| 名称 | Hex | Tailwind | 用途 |
|------|-----|----------|------|
| Primary-50 | `#f0f9ff` | `sky-50` | 浅色背景 |
| Primary-100 | `#e0f2fe` | `sky-100` | 悬停背景 |
| Primary-500 | `#0ea5e9` | `sky-500` | 主按钮、链接 |
| Primary-600 | `#0284c7` | `sky-600` | 主按钮悬停 |
| Primary-700 | `#0369a1` | `sky-700` | 主按钮激活 |

### 辅助色 (Secondary)

| 名称 | Hex | Tailwind | 用途 |
|------|-----|----------|------|
| Secondary-500 | `#8b5cf6` | `violet-500` | 强调、标签 |
| Secondary-600 | `#7c3aed` | `violet-600` | 强调悬停 |

### 中性色 (Neutral)

| 名称 | Hex | Tailwind | 用途 |
|------|-----|----------|------|
| Neutral-50 | `#fafafa` | `gray-50` | 页面背景 |
| Neutral-100 | `#f4f4f5` | `gray-100` | 卡片背景 |
| Neutral-200 | `#e4e4e7` | `gray-200` | 边框、分割线 |
| Neutral-300 | `#d4d4d8` | `gray-300` | 禁用边框 |
| Neutral-400 | `#a1a1aa` | `gray-400` | 次要文本 |
| Neutral-500 | `#71717a` | `gray-500` | 占位符 |
| Neutral-600 | `#52525b` | `gray-600` | 正文文本 |
| Neutral-700 | `#3f3f46` | `gray-700` | 标题文本 |
| Neutral-800 | `#27272a` | `gray-800` | 主标题 |
| Neutral-900 | `#18181b` | `gray-900` | 强调文本 |

### 语义色 (Semantic)

| 名称 | Hex | Tailwind | 用途 |
|------|-----|----------|------|
| Success | `#22c55e` | `green-500` | 成功状态 |
| Warning | `#f59e0b` | `amber-500` | 警告状态 |
| Error | `#ef4444` | `red-500` | 错误状态 |
| Info | `#0ea5e9` | `sky-500` | 信息提示 |

---

## 📝 字体规范

### 字体族

```css
/* 英文字体栈 */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* 中文字体栈 */
font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;

/* 等宽字体（代码块） */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### 字号规范

| 级别 | 名称 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|------|
| xs | Extra Small | 12px (0.75rem) | 1.5 | 400 | 辅助信息、标签 |
| sm | Small | 14px (0.875rem) | 1.5 | 400 | 次要文本、说明 |
| base | Base | 16px (1rem) | 1.6 | 400 | 正文内容 |
| lg | Large | 18px (1.125rem) | 1.6 | 500 | 小标题 |
| xl | Extra Large | 20px (1.25rem) | 1.5 | 600 | 卡片标题 |
| 2xl | 2X Large | 24px (1.5rem) | 1.4 | 600 | 页面标题 |
| 3xl | 3X Large | 30px (1.875rem) | 1.3 | 700 | 大标题 |

### 字重规范

| 名称 | 值 | 用途 |
|------|-----|------|
| Regular | 400 | 正文 |
| Medium | 500 | 强调文本 |
| Semibold | 600 | 标题 |
| Bold | 700 | 主标题、CTA |

---

## 📐 间距规范

### 基础间距单位

基础单位：`4px` (Tailwind 默认)

| Token | 值 | Tailwind | 用途 |
|-------|-----|----------|------|
| space-1 | 4px | `1` | 最小间距 |
| space-2 | 8px | `2` | 紧凑间距 |
| space-3 | 12px | `3` | 小组件间距 |
| space-4 | 16px | `4` | 标准间距 |
| space-5 | 20px | `5` | 中等间距 |
| space-6 | 24px | `6` | 大间距 |
| space-8 | 32px | `8` | 分区间距 |
| space-10 | 40px | `10` | 大分区 |
| space-12 | 48px | `12` | 超大分区 |
| space-16 | 64px | `16` | 页面边距 |

### 布局间距

```
侧边栏宽度：280px
侧边栏内边距：16px (p-4)
主内容区内边距：24px (p-6)
组件内边距：16px (p-4)
卡片内边距：20px (p-5)
```

---

## 🧩 组件样式参考

### 按钮 (Button)

```html
<!-- 主按钮 -->
<button class="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium 
               hover:bg-sky-600 active:bg-sky-700 
               disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
               transition-colors duration-200">
  按钮文本
</button>

<!-- 次级按钮 -->
<button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium
               hover:bg-gray-50 active:bg-gray-100
               disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
               transition-colors duration-200">
  取消
</button>

<!-- 文字按钮 -->
<button class="px-2 py-1 text-sky-500 font-medium
               hover:text-sky-600 hover:underline
               disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed
               transition-colors duration-200">
  了解更多
</button>
```

### 输入框 (Input)

```html
<input type="text" 
       class="w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
              placeholder:text-gray-400
              transition-shadow duration-200"
       placeholder="请输入..." />
```

### 卡片 (Card)

```html
<div class="bg-white rounded-xl border border-gray-200 shadow-sm
            hover:shadow-md transition-shadow duration-200">
  <div class="p-5">
    <!-- 内容 -->
  </div>
</div>
```

### 笔记列表项 (Note Item)

```html
<div class="flex items-center gap-3 px-4 py-3 rounded-lg
            hover:bg-gray-100 cursor-pointer
            active:bg-gray-200
            transition-colors duration-150">
  <div class="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0"></div>
  <div class="flex-1 min-w-0">
    <h3 class="text-sm font-medium text-gray-800 truncate">笔记标题</h3>
    <p class="text-xs text-gray-500 truncate">最后编辑时间</p>
  </div>
</div>
```

### 标签 (Badge)

```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
             bg-sky-100 text-sky-700">
  标签
</span>
```

### 分割线 (Divider)

```html
<hr class="border-gray-200" />
```

### 滚动条 (Scrollbar)

```css
/* 自定义滚动条样式 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f4f4f5;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d4d4d8;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}
```

---

## 🎯 交互状态规范

### 通用状态

| 状态 | 描述 | 样式变化 |
|------|------|----------|
| Default | 默认状态 | 基础样式 |
| Hover | 鼠标悬停 | 背景变深 5-10%，或添加阴影 |
| Active | 点击激活 | 背景变深 15-20%，或缩放 0.98 |
| Focus | 键盘聚焦 | 添加 2px 环 (ring-2) |
| Disabled | 禁用 | 灰色、无指针、opacity-50 |

### 过渡动画

```css
/* 标准过渡 */
transition: all 0.2s ease-in-out;

/* 快速过渡（小组件） */
transition: all 0.15s ease-in-out;

/* 慢速过渡（大元素） */
transition: all 0.3s ease-in-out;
```

---

## 📱 响应式断点

| 断点 | 最小宽度 | 用途 |
|------|----------|------|
| sm | 640px | 手机横屏 |
| md | 768px | 平板竖屏 |
| lg | 1024px | 平板横屏/小桌面 |
| xl | 1280px | 标准桌面 |
| 2xl | 1536px | 大桌面 |

### 布局适配

```
移动端 (< 768px):
  - 侧边栏隐藏，使用汉堡菜单
  - 编辑/预览切换显示
  - 全宽布局

平板端 (768px - 1024px):
  - 侧边栏可折叠
  - 编辑/预览并排

桌面端 (> 1024px):
  - 固定侧边栏 280px
  - 编辑/预览分栏
  - 完整功能展示
```

---

## ♿ 无障碍规范

### 对比度要求

- 正常文本：≥ 4.5:1
- 大文本 (18px+ 或 14px+bold)：≥ 3:1
- UI 组件/图形：≥ 3:1

### 键盘导航

- 所有交互元素可通过 Tab 键访问
- Focus 状态清晰可见 (ring-2)
- Escape 键关闭弹窗/取消操作
- Enter/Space 激活按钮

### ARIA 标签

```html
<button aria-label="新建笔记">+</button>
<nav aria-label="主导航">...</nav>
<aside aria-label="笔记列表">...</aside>
```

---

*最后更新：2026-03-07*
