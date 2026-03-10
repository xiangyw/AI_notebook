import { useNoteStore } from '../../stores/noteStore'
import { getFilteredNotes } from '../../stores/noteStore'

function NoteList() {
  const { notes, selectedNoteId, selectNote, deleteNote, restoreNote, toggleFavorite, selectedFolderId, uiState } = useNoteStore()
  
  const filteredNotes = getFilteredNotes(notes, selectedFolderId, uiState.searchQuery)

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // 获取内容预览
  const getPreview = (content?: string) => {
    if (!content) return '无内容'
    const plainText = content
      .replace(/^[#*\-\[\]]+\s*/gm, '')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim()
    return plainText.substring(0, 80) || '无内容'
  }

  // 处理删除笔记
  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    
    if (selectedFolderId === 'trash') {
      // 在回收站中：确认永久删除
      if (confirm('确定要永久删除这篇笔记吗？此操作不可恢复。')) {
        await deleteNote(noteId, true)
      }
    } else {
      // 正常删除：软删除
      if (confirm('确定要删除这篇笔记吗？')) {
        await deleteNote(noteId, false)
      }
    }
  }

  // 处理恢复笔记
  const handleRestore = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    try {
      await restoreNote(noteId)
    } catch (error) {
      console.error('Failed to restore note:', error)
      alert('恢复笔记失败')
    }
  }

  // 处理收藏/取消收藏
  const handleToggleFavorite = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    try {
      await toggleFavorite(noteId)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  // 空状态
  if (filteredNotes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-sm">暂无笔记</p>
          <p className="text-xs mt-1">点击"+新建"创建笔记</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin" data-testid="note-list">
      <ul className="divide-y divide-gray-100">
        {filteredNotes.map((note) => {
          const isSelected = selectedNoteId === note.id
          const preview = getPreview(note.content)
          const isInTrash = selectedFolderId === 'trash'

          return (
            <li key={note.id} data-testid={`note-item-${note.id}`} className="note-item">
              <div
                draggable={!isInTrash}
                onDragStart={(e) => {
                  if (isInTrash) {
                    e.preventDefault()
                    return
                  }
                  e.dataTransfer.setData('text/plain', note.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onClick={() => selectNote(note.id)}
                className={`group flex items-start gap-3 px-4 py-3 cursor-move transition-colors duration-150 ${
                  isSelected
                    ? 'bg-primary-50 border-l-4 border-primary-500'
                    : 'hover:bg-gray-50 active:bg-gray-100 border-l-4 border-transparent'
                } ${isInTrash ? 'opacity-75' : ''}`}
                data-testid={`note-draggable-${note.id}`}
              >
                {/* 拖拽图标（回收站不显示） */}
                {!isInTrash && (
                  <div className="text-gray-300 cursor-grab">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                )}

                {/* 状态指示器 */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                    isSelected ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                />

                {/* 内容区域 */}
                <div className="flex-1 min-w-0">
                  {/* 标题和收藏图标 */}
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-medium truncate ${
                        isSelected ? 'text-primary-700' : 'text-gray-800'
                      }`}
                    >
                      {note.title || '无标题'}
                    </h3>
                    {/* 收藏图标（回收站不显示） */}
                    {!isInTrash && (
                      <button
                        onClick={(e) => handleToggleFavorite(e, note.id)}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                        aria-label={note.isFavorite ? '取消收藏' : '收藏'}
                        title={note.isFavorite ? '取消收藏' : '收藏'}
                      >
                        <span className="text-sm">
                          {note.isFavorite ? '⭐' : '☆'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* 预览 */}
                  <p className="text-xs text-gray-500 truncate mt-1">{preview}</p>

                  {/* 元信息 */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{formatDate(note.updatedAt)}</span>
                    {note.isFavorite && !isInTrash && <span className="text-xs">⭐</span>}
                  </div>
                </div>

                {/* 操作按钮（悬停显示） */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {isInTrash ? (
                    <>
                      {/* 回收站：恢复按钮 */}
                      <button
                        onClick={(e) => handleRestore(e, note.id)}
                        className="p-1.5 rounded hover:bg-green-100 transition-all"
                        aria-label="恢复笔记"
                        title="恢复笔记"
                      >
                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                      </button>
                      {/* 回收站：永久删除按钮 */}
                      <button
                        onClick={(e) => handleDelete(e, note.id)}
                        className="p-1.5 rounded hover:bg-red-100 transition-all"
                        aria-label="永久删除"
                        title="永久删除"
                      >
                        <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    /* 正常列表：软删除按钮 */
                    <button
                      onClick={(e) => handleDelete(e, note.id)}
                      className="p-1.5 rounded hover:bg-gray-200 transition-all"
                      aria-label="删除笔记"
                      title="删除笔记"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* 底部提示 */}
      <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100">
        {selectedFolderId === 'trash'
          ? `回收站：${filteredNotes.length} 篇笔记`
          : `共 ${filteredNotes.length} 篇笔记 · 可拖拽到文件夹`}
      </div>
    </div>
  )
}

export default NoteList
