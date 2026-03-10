import { useState, useEffect } from 'react'
import { useNoteStore } from '../../stores/noteStore'
import { foldersApi } from '../../services/api'

interface ApiFolder {
  path: string
  name: string
  noteCount: number
}

function FolderTree() {
  const { selectedFolderId, selectFolder, notes, moveNote } = useNoteStore()
  const [folders, setFolders] = useState<ApiFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderPath, setNewFolderPath] = useState('')
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const data = await foldersApi.getAll()
      setFolders(data)
    } catch (error) {
      console.error('Failed to load folders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim() || !newFolderPath.trim()) return

    try {
      await foldersApi.create({
        path: newFolderPath.trim(),
        name: newFolderName.trim(),
      })
      setNewFolderName('')
      setNewFolderPath('')
      setShowCreate(false)
      await loadFolders()
    } catch (error) {
      console.error('Failed to create folder:', error)
      alert('创建文件夹失败：可能已存在')
    }
  }

  const handleDeleteFolder = async (folderPath: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`确定要删除文件夹 "${folderPath}" 吗？`)) return

    try {
      await foldersApi.delete(folderPath)
      if (selectedFolderId === folderPath) {
        selectFolder('all')
      }
      await loadFolders()
    } catch (error) {
      console.error('Failed to delete folder:', error)
      alert('删除文件夹失败：文件夹可能包含笔记')
    }
  }

  // 拖拽放置到文件夹
  const handleDrop = async (folderId: string, e: React.DragEvent) => {
    e.preventDefault()
    setDragOverFolder(null)
    const noteId = e.dataTransfer.getData('text/plain')
    if (!noteId) return

    try {
      await moveNote(noteId, folderId)
    } catch (error) {
      console.error('Failed to move note:', error)
      alert('移动笔记失败')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // 计算每个文件夹的笔记数量（本地计算）
  const getNoteCount = (folderPath: string) => {
    if (folderPath === 'all' || folderPath === 'favorites' || folderPath === 'trash') {
      return 0
    }
    return notes.filter((n) => n.folderId === folderPath).length
  }

  // 默认文件夹
  const defaultFolders = [
    { path: 'all', name: '全部笔记', icon: '📝' },
    { path: 'favorites', name: '收藏夹', icon: '⭐' },
    { path: 'trash', name: '回收站', icon: '🗑️' },
  ]

  return (
    <nav className="p-2 space-y-1" data-testid="folder-tree">
      {/* 默认文件夹 */}
      {defaultFolders.map((folder) => {
        const isActive = selectedFolderId === folder.path
        const noteCount = folder.path === 'all' ? notes.length : 0

        return (
          <button
            key={folder.path}
            onClick={() => selectFolder(folder.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 folder-item`}
            data-testid={`folder-item-${folder.path}`}
            data-folder-path={folder.path}
          >
            <span className="text-lg flex-shrink-0">{folder.icon}</span>
            <span className="flex-1 text-left truncate">{folder.name}</span>
            {noteCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-primary-200 text-primary-700' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {noteCount}
              </span>
            )}
          </button>
        )
      })}

      {/* 分割线 */}
      <hr className="my-2 border-gray-200" />

      {/* 自定义文件夹标题 */}
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-semibold text-gray-500 uppercase">文件夹</span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-primary-600 hover:text-primary-700"
        >
          {showCreate ? '取消' : '+'}
        </button>
      </div>

      {/* 创建文件夹表单 */}
      {showCreate && (
        <form onSubmit={handleCreateFolder} className="px-3 py-2 space-y-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="文件夹名称..."
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoFocus
          />
          <input
            type="text"
            value={newFolderPath}
            onChange={(e) => setNewFolderPath(e.target.value)}
            placeholder="路径 (如：work)"
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="submit"
            className="w-full px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            创建
          </button>
        </form>
      )}

      {/* 自定义文件夹列表 */}
      {loading ? (
        <div className="px-3 py-2 text-xs text-gray-400">加载中...</div>
      ) : folders.length === 0 ? (
        <div className="px-3 py-2 text-xs text-gray-400">暂无文件夹</div>
      ) : (
        folders.map((folder) => {
          const isActive = selectedFolderId === folder.path
          const noteCount = getNoteCount(folder.path)
          const isDragOver = dragOverFolder === folder.path

          return (
            <div
              key={folder.path}
              onDragOver={(e) => {
                handleDragOver(e)
                setDragOverFolder(folder.path)
              }}
              onDragLeave={() => setDragOverFolder(null)}
              onDrop={(e) => handleDrop(folder.path, e)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 folder-item ${
                isActive
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${isDragOver ? 'bg-primary-200 ring-2 ring-primary-400' : ''}`}
              data-testid={`folder-item-${folder.path}`}
              data-folder-path={folder.path}
            >
              <button
                onClick={() => selectFolder(folder.path)}
                className="flex-1 flex items-center gap-3 text-left truncate"
                data-testid={`folder-button-${folder.path}`}
              >
                <span className="text-lg">📁</span>
                <span className="truncate">{folder.name}</span>
              </button>
              {noteCount > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-primary-200 text-primary-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {noteCount}
                </span>
              )}
              <button
                onClick={(e) => handleDeleteFolder(folder.path, e)}
                className="text-gray-400 hover:text-red-500"
                aria-label="删除文件夹"
              >
                ×
              </button>
            </div>
          )
        })
      )}
    </nav>
  )
}

export default FolderTree
