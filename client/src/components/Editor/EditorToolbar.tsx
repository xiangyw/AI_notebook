interface EditorToolbarProps {
  onInsert: (text: string, placeholder?: string) => void
}

function EditorToolbar({ onInsert }: EditorToolbarProps) {
  const tools = [
    {
      id: 'bold',
      label: '加粗',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v3.172a3 3 0 011.193.62l2.828-1.414a1 1 0 011.364.363l1 1.732a1 1 0 01-.363 1.364L14.193 10a3 3 0 010 2.236l2.829 1.193a1 1 0 01.363 1.364l-1 1.732a1 1 0 01-1.364.363L12.193 15.46A3 3 0 0111 16.082V19a1 1 0 01-1 1H9a1 1 0 01-1-1v-3.172a3 3 0 01-1.193-.62l-2.828 1.414a1 1 0 01-1.364-.363l-1-1.732a1 1 0 01.363-1.364L4.807 12a3 3 0 010-2.236L1.979 8.572a1 1 0 01-.363-1.364l1-1.732a1 1 0 011.364-.363L6.807 6.54A3 3 0 018 5.918V3a1 1 0 011-1h1z" />
        </svg>
      ),
      action: () => onInsert('****', '粗体文本'),
    },
    {
      id: 'italic',
      label: '斜体',
      icon: (
        <span className="font-serif italic font-bold text-sm">I</span>
      ),
      action: () => onInsert('**', '斜体文本'),
    },
    {
      id: 'heading1',
      label: '标题 1',
      icon: <span className="font-bold text-sm">H1</span>,
      action: () => onInsert('# ', '标题 1'),
    },
    {
      id: 'heading2',
      label: '标题 2',
      icon: <span className="font-bold text-sm">H2</span>,
      action: () => onInsert('## ', '标题 2'),
    },
    {
      id: 'heading3',
      label: '标题 3',
      icon: <span className="font-bold text-sm">H3</span>,
      action: () => onInsert('### ', '标题 3'),
    },
    {
      id: 'divider',
      type: 'divider' as const,
    },
    {
      id: 'link',
      label: '链接',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      action: () => onInsert('[', '链接文本](url)'),
    },
    {
      id: 'image',
      label: '图片',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      action: () => onInsert('![', '图片描述](image-url)'),
    },
    {
      id: 'list',
      label: '列表',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      action: () => onInsert('- ', '列表项'),
    },
    {
      id: 'checkbox',
      label: '任务列表',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      action: () => onInsert('- [ ] ', '任务'),
    },
    {
      id: 'code',
      label: '代码',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
      action: () => onInsert('```\n', '代码\n```'),
    },
    {
      id: 'quote',
      label: '引用',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-3.172l1.586 1.586a1 1 0 11-1.414 1.414L11.414 17H5a2 2 0 01-2-2V5zm2 0v8h8.586l-2-2H13a1 1 0 01-1-1V7a1 1 0 011-1h2V5H5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      action: () => onInsert('> ', '引用文本'),
    },
  ]

  return (
    <div className="h-10 border-b border-gray-200 bg-white flex items-center gap-1 px-2 flex-shrink-0">
      {tools.map((tool, index) => {
        if (tool.type === 'divider') {
          return <div key={index} className="w-px h-5 bg-gray-200 mx-1" />
        }

        return (
          <button
            key={tool.id}
            onClick={tool.action}
            title={tool.label}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
          >
            {tool.icon}
          </button>
        )
      })}

      {/* 右侧：编辑模式切换提示 */}
      <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
        <span className="hidden sm:inline">Markdown</span>
      </div>
    </div>
  )
}

export default EditorToolbar
