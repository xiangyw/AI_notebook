# Notebook Tailwind 配置参考

> 基于 Tailwind CSS v3.x 的定制配置

---

## 📦 完整配置文件

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      // 颜色配置
      colors: {
        // 主色 - Sky Blue
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // 辅助色 - Violet
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      
      // 字体配置
      fontFamily: {
        sans: [
          'Inter',
          'PingFang SC',
          'Microsoft YaHei',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'Monaco',
          'monospace',
        ],
      },
      
      // 字号配置
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'base': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'lg': ['18px', { lineHeight: '1.6', fontWeight: '500' }],
        'xl': ['20px', { lineHeight: '1.5', fontWeight: '600' }],
        '2xl': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        '3xl': ['30px', { lineHeight: '1.3', fontWeight: '700' }],
        '4xl': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      
      // 间距配置
      spacing: {
        'sidebar': '280px',
        'nav': '56px',
        'status': '32px',
      },
      
      // 圆角配置
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      
      // 阴影配置
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      
      // 动画配置
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      
      // 关键帧配置
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      
      // 过渡配置
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      
      //  zIndex 配置
      zIndex: {
        '100': '100',
        '200': '200',
        '300': '300',
      },
    },
  },
  plugins: [
    // 可选插件
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
}
```

---

## 🎨 简化配置 (推荐)

如果只需要核心功能，使用简化配置:

```js
// tailwind.config.minimal.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'sidebar': '280px',
        'nav': '56px',
        'status': '32px',
      },
    },
  },
  plugins: [],
}
```

---

## 📝 PostCSS 配置

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 🎯 常用工具类组合

### 布局类

```html
<!-- 主容器 -->
<div class="h-screen flex flex-col bg-gray-50">

<!-- 三栏布局 -->
<div class="flex flex-1 overflow-hidden">
  <aside class="w-sidebar">...</aside>
  <main class="flex-1">...</main>
  <aside class="w-64">...</aside>
</div>

<!-- 居中容器 -->
<div class="min-h-screen flex items-center justify-center">

<!-- 网格布局 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### 组件类

```html
<!-- 卡片 -->
<div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">

<!-- 按钮 - 主按钮 -->
<button class="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium 
               hover:bg-primary-600 active:bg-primary-700
               disabled:bg-gray-300 disabled:cursor-not-allowed
               transition-colors duration-200">

<!-- 按钮 - 次级按钮 -->
<button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
               hover:bg-gray-50 active:bg-gray-100
               transition-colors duration-200">

<!-- 输入框 -->
<input class="w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500
              placeholder:text-gray-400" />

<!-- 笔记列表项 -->
<div class="flex items-center gap-3 px-4 py-3 rounded-lg
            hover:bg-gray-100 cursor-pointer
            active:bg-gray-200
            transition-colors duration-150">

<!-- 标签 -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full 
             text-xs font-medium bg-primary-100 text-primary-700">
```

### 文本类

```html
<!-- 标题层级 -->
<h1 class="text-3xl font-bold text-gray-900">页面标题</h1>
<h2 class="text-2xl font-semibold text-gray-800">章节标题</h2>
<h3 class="text-xl font-semibold text-gray-700">小节标题</h3>
<h4 class="text-lg font-medium text-gray-700">卡片标题</h4>

<!-- 正文 -->
<p class="text-base text-gray-600 leading-relaxed">正文内容</p>

<!-- 次要文本 -->
<p class="text-sm text-gray-500">说明文字</p>
<p class="text-xs text-gray-400">辅助信息</p>

<!-- 链接 -->
<a class="text-primary-500 hover:text-primary-600 hover:underline">链接</a>
```

### 状态类

```html
<!-- 成功状态 -->
<div class="flex items-center gap-2 text-green-600">
  <span>✅</span>
  <span>保存成功</span>
</div>

<!-- 警告状态 -->
<div class="flex items-center gap-2 text-amber-600">
  <span>⚠️</span>
  <span>未保存的更改</span>
</div>

<!-- 错误状态 -->
<div class="flex items-center gap-2 text-red-600">
  <span>❌</span>
  <span>保存失败</span>
</div>

<!-- 加载状态 -->
<div class="animate-pulse">
  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
</div>
```

---

## 📱 响应式工具类

```html
<!-- 隐藏/显示 -->
<div class="hidden md:block">仅在中等屏幕以上显示</div>
<div class="block md:hidden">仅在中等屏幕以下显示</div>

<!-- 宽度适配 -->
<div class="w-full md:w-1/2 lg:w-1/3">

<!-- 间距适配 -->
<div class="p-4 md:p-6 lg:p-8">

<!-- 字体适配 -->
<h1 class="text-xl md:text-2xl lg:text-3xl">

<!-- 布局适配 -->
<div class="flex flex-col md:flex-row lg:flex-row">
```

---

## 🎨 暗黑模式配置

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 或 'media'
  theme: {
    extend: {
      colors: {
        // 暗黑模式覆盖
        dark: {
          bg: '#18181b',      // gray-900
          surface: '#27272a', // gray-800
          border: '#3f3f46',  // gray-700
        },
      },
    },
  },
}
```

```html
<!-- 使用暗黑模式 -->
<div class="bg-white dark:bg-dark-bg">
  <p class="text-gray-900 dark:text-gray-100">
```

---

## 🔌 推荐插件

### 安装

```bash
npm install -D @tailwindcss/forms @tailwindcss/typography tailwind-scrollbar
```

### forms 插件 - 表单样式

```js
// tailwind.config.js
plugins: [
  require('@tailwindcss/forms'),
]
```

```html
<!-- 默认美化 -->
<input type="text" class="form-input" />
<select class="form-select"></select>
<checkbox class="form-checkbox" />
```

### typography 插件 - Markdown 渲染

```js
// tailwind.config.js
plugins: [
  require('@tailwindcss/typography'),
]
```

```html
<!-- Markdown 预览 -->
<article class="prose prose-lg max-w-none">
  <!-- 渲染的 Markdown 内容 -->
</article>
```

### scrollbar 插件 - 自定义滚动条

```js
// tailwind.config.js
plugins: [
  require('tailwind-scrollbar'),
]
```

```html
<!-- 细滚动条 -->
<div class="overflow-y-auto scrollbar-thin">

<!-- 隐藏滚动条但保持滚动 -->
<div class="overflow-y-auto scrollbar-hide">
```

---

## 🚀 性能优化

### PurgeCSS 配置

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
    './public/index.html',
  ],
  // 生产环境自动 purge
}
```

### 按需加载

```css
/* styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义组件 */
@layer components {
  .notebook-nav-item {
    @apply flex items-center gap-3 px-4 py-3 rounded-lg
           text-gray-600 hover:bg-gray-100 cursor-pointer
           transition-colors duration-150;
  }
  
  .notebook-nav-item.active {
    @apply bg-sky-100 text-sky-700 font-medium;
  }
}
```

---

## 📋 快速参考表

### 颜色速查

| 用途 | Tailwind 类 |
|------|-------------|
| 主背景 | `bg-gray-50` |
| 卡片背景 | `bg-white` |
| 主按钮 | `bg-primary-500` |
| 主按钮悬停 | `hover:bg-primary-600` |
| 边框 | `border-gray-200` |
| 主文本 | `text-gray-900` |
| 次文本 | `text-gray-600` |
| 占位符 | `text-gray-400` |

### 间距速查

| 用途 | Tailwind 类 |
|------|-------------|
| 页面边距 | `p-6` (24px) |
| 卡片内边距 | `p-5` (20px) |
| 组件间距 | `p-4` (16px) |
| 紧凑间距 | `p-2` (8px) |
| 元素间隙 | `gap-4` (16px) |

### 圆角速查

| 用途 | Tailwind 类 |
|------|-------------|
| 按钮 | `rounded-lg` (12px) |
| 卡片 | `rounded-xl` (16px) |
| 输入框 | `rounded-lg` (12px) |
| 标签 | `rounded-full` |
| 头像 | `rounded-full` |

---

## 🧪 开发环境设置

### 1. 安装依赖

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. 配置 content

```js
// tailwind.config.js
content: [
  './src/**/*.{js,jsx,ts,tsx}',
  './public/index.html',
]
```

### 3. 添加指令

```css
/* src/styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. 引入样式

```js
// src/main.js / src/index.js
import './styles.css'
```

### 5. 启动开发服务器

```bash
npm run dev
```

---

*最后更新：2026-03-07*
