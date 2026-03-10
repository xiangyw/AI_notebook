import { useState, useEffect, useCallback, useRef } from 'react'
import EditorComponent from '@monaco-editor/react'
import { useNoteStore } from '../../stores/noteStore'
import EditorToolbar from './EditorToolbar'
import MarkdownPreview from './MarkdownPreview'

function Editor() {
  const { selectedNoteId, notes, updateNote, uiState, setEditorMode, saveStatus } = useNoteStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const saveTimeoutRef = useRef<number | null>(null)

  // 找到当前选中的笔记
  const note = notes.find((n) => n.id === selectedNoteId)

  // 同步笔记数据（仅在首次加载或切换笔记时）
  useEffect(() => {
    if (note) {
      // 只在标题/内容为空时同步，避免覆盖用户输入
      if (title === '' && content === '') {
        setTitle(note.title)
        setContent(note.content)
      } else if (note.id !== selectedNoteId) {
        // 切换笔记时同步
        setTitle(note.title)
        setContent(note.content)
      }
    }
  }, [note?.id])

  // 防抖保存（500ms）
  const debouncedUpdate = useCallback((updatedNote: typeof note) => {
    if (!updatedNote) return
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateNote(updatedNote)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 500)
  }, [updateNote])

  // 处理标题变更
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      setTitle(newTitle)
      if (note) {
        debouncedUpdate({ ...note, title: newTitle })
      }
    },
    [note, debouncedUpdate]
  )

  // 处理内容变更
  const handleContentChange = useCallback(
    (value: string | undefined) => {
      const newContent = value || ''
      setContent(newContent)
      if (note) {
        debouncedUpdate({ ...note, content: newContent })
      }
    },
    [note, debouncedUpdate]
  )

  // 工具栏插入文本
  const handleToolbarInsert = useCallback(
    (prefix: string, placeholder?: string) => {
      if (!note) return

      const textToInsert = placeholder ? prefix + placeholder : prefix
      const newContent = content ? content + '\n' + textToInsert : textToInsert
      setContent(newContent)
      debouncedUpdate({ ...note, content: newContent })
    },
    [note, content, debouncedUpdate]
  )

  // 格式化保存时间
  const formatSaveTime = () => {
    if (!saveStatus.lastSaved) return ''
    const date = new Date(saveStatus.lastSaved)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 5) return '刚刚'
    if (diff < 60) return `${diff}秒前`
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 无选中笔记
  if (!note) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400 animate-fade-in">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg font-medium text-gray-600">选择或创建一篇笔记</p>
          <p className="text-sm mt-2">开始记录你的想法</p>
        </div>
      </div>
    )
  }

  // 渲染编辑器模式
  const renderEditor = () => {
    if (uiState.editorMode === 'preview') {
      return (
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
          <MarkdownPreview content={content} />
        </div>
      )
    }

    if (uiState.editorMode === 'edit') {
      return (
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar onInsert={handleToolbarInsert} />
          <div className="flex-1 overflow-hidden">
            <EditorComponent
              height="100%"
              defaultLanguage="markdown"
              theme={uiState.darkMode ? 'vs-dark' : 'vs-light'}
              value={content}
              onChange={handleContentChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>
      )
    }

    // split 模式
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑区 */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          <EditorToolbar onInsert={handleToolbarInsert} />
          <div className="flex-1 overflow-hidden">
            <EditorComponent
              height="100%"
              defaultLanguage="markdown"
              theme={uiState.darkMode ? 'vs-dark' : 'vs-light'}
              value={content}
              onChange={handleContentChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>

        {/* 预览区 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-gray-50">
          <MarkdownPreview content={content} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      {/* 标题栏 */}
      <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="笔记标题..."
          className="w-full text-2xl font-bold text-gray-800 border-none outline-none placeholder-gray-400 bg-transparent"
        />
        <div className="flex items-center gap-4 mt-2 text-xs">
          {/* 保存状态 */}
          <div className="flex items-center gap-1.5">
            {saveStatus.status === 'saving' && (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-gray-500">保存中...</span>
              </>
            )}
            {saveStatus.status === 'saved' && (
              <>
                <span className="text-green-500">✓</span>
                <span className="text-gray-500">已保存 {formatSaveTime()}</span>
              </>
            )}
            {saveStatus.status === 'error' && (
              <>
                <span className="text-red-500">✗</span>
                <span className="text-red-500">保存失败</span>
              </>
            )}
          </div>

          {/* 字数统计 */}
          <div className="text-gray-400">
            {content.length} 字符 · {content.split(/\s+/).filter(Boolean).length} 词
          </div>
        </div>
      </div>

      {/* 编辑模式切换栏 */}
      <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center justify-center gap-1 px-4 flex-shrink-0">
        <button
          onClick={() => setEditorMode('edit')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            uiState.editorMode === 'edit'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          编辑
        </button>
        <button
          onClick={() => setEditorMode('split')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors hidden sm:block ${
            uiState.editorMode === 'split'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          分栏
        </button>
        <button
          onClick={() => setEditorMode('preview')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            uiState.editorMode === 'preview'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          预览
        </button>
      </div>

      {/* 编辑器/预览区 */}
      {renderEditor()}
    </div>
  )
}

export default Editor
