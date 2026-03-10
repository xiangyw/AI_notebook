import { useMemo } from 'react'

interface MarkdownPreviewProps {
  content: string
}

// 简单的 Markdown 渲染器
function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const html = useMemo(() => {
    if (!content) {
      return '<p class="text-gray-400 italic">暂无内容</p>'
    }

    let html = content

    // 转义 HTML 特殊字符
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // 代码块 (```code```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-gray-100 rounded-lg p-4 my-3 overflow-x-auto"><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`
    })

    // 行内代码 (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-600">$1</code>')

    // 标题 (# H1, ## H2, etc.)
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-gray-800 mt-7 mb-4">$1</h2>')
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')

    // 粗体 (**text**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // 斜体 (*text*)
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

    // 删除线 (~~text~~)
    html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-gray-400">$1</del>')

    // 链接 ([text](url))
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:text-primary-600 hover:underline">$1</a>')

    // 图片 (![alt](url))
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')

    // 引用 (> text)
    html = html.replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-gray-50 rounded-r-lg text-gray-600">$1</blockquote>')

    // 无序列表 (- item)
    html = html.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-3 space-y-1">$&</ul>')

    // 任务列表 (- [ ] item, - [x] item)
    html = html.replace(/^- \[ \] (.*$)/gm, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" class="rounded" disabled /> <span>$1</span></li>')
    html = html.replace(/^- \[x\] (.*$)/gim, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" class="rounded" checked disabled /> <span class="line-through text-gray-400">$1</span></li>')

    // 水平分割线 (---)
    html = html.replace(/^---$/gm, '<hr class="my-6 border-gray-200" />')

    // 段落 (双换行)
    html = html.replace(/\n\n/g, '</p><p class="my-3">')

    // 单换行
    html = html.replace(/\n/g, '<br />')

    // 包裹在段落中
    html = `<p class="my-3">${html}</p>`

    // 清理空段落
    html = html.replace(/<p class="my-3"><\/p>/g, '')
    html = html.replace(/<p class="my-3"><br \/><\/p>/g, '')

    return html
  }, [content])

  return (
    <div
      className="prose prose-sm max-w-none p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default MarkdownPreview
