import { useNoteStore } from '../../stores/noteStore'

function StatusBar() {
  const { notes, selectedNoteId, saveStatus, uiState, toggleDarkMode } = useNoteStore()

  // 计算统计数据
  const totalNotes = notes.length
  const totalWords = notes.reduce((sum, note) => sum + note.content.split(/\s+/).filter(Boolean).length, 0)

  // 当前笔记信息
  const currentNote = notes.find((n) => n.id === selectedNoteId)
  const currentNoteWords = currentNote?.content.split(/\s+/).filter(Boolean).length || 0

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

  return (
    <footer className="h-status bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs flex-shrink-0">
      {/* 左侧：统计信息 */}
      <div className="flex items-center gap-4 text-gray-500">
        {/* 笔记总数 */}
        <div className="flex items-center gap-1.5">
          <span>📊</span>
          <span>{totalNotes} 篇笔记</span>
        </div>

        {/* 字数统计 */}
        <div className="flex items-center gap-1.5">
          <span>📝</span>
          {currentNote ? (
            <span>{currentNoteWords} 字</span>
          ) : (
            <span>共 {totalWords} 字</span>
          )}
        </div>

        {/* 保存状态 */}
        <div className="flex items-center gap-1.5">
          {saveStatus.status === 'saving' && (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-600">保存中...</span>
            </>
          )}
          {saveStatus.status === 'saved' && (
            <>
              <span className="text-green-500">✓</span>
              <span className="text-green-600">已保存 {formatSaveTime()}</span>
            </>
          )}
          {saveStatus.status === 'error' && (
            <>
              <span className="text-red-500">✗</span>
              <span className="text-red-600">保存失败</span>
            </>
          )}
          {saveStatus.status === 'idle' && <span>就绪</span>}
        </div>
      </div>

      {/* 右侧：功能按钮 */}
      <div className="flex items-center gap-3 text-gray-500">
        {/* 编辑器模式提示 */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-gray-400">|</span>
          <span>模式：{uiState.editorMode === 'edit' ? '编辑' : uiState.editorMode === 'preview' ? '预览' : '分栏'}</span>
        </div>

        {/* 暗黑模式切换 */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          title={uiState.darkMode ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {uiState.darkMode ? (
            <>
              <span>☀️</span>
              <span className="hidden sm:inline">亮色</span>
            </>
          ) : (
            <>
              <span>🌙</span>
              <span className="hidden sm:inline">暗色</span>
            </>
          )}
        </button>

        {/* 版本信息 */}
        <div className="hidden md:flex items-center gap-1 text-gray-400">
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  )
}

export default StatusBar
