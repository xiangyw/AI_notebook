import { useState, useEffect } from 'react'
import { tagsApi, type TagInfo } from '../../services/api'

interface TagCloudProps {
  onTagClick?: (tag: string) => void
}

function TagCloud({ onTagClick }: TagCloudProps) {
  const [tags, setTags] = useState<TagInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      const data = await tagsApi.getAll()
      setTags(data)
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    try {
      await tagsApi.create(newTagName.trim())
      setNewTagName('')
      setShowCreate(false)
      await loadTags()
    } catch (error) {
      console.error('Failed to create tag:', error)
      alert('创建标签失败')
    }
  }

  const handleDeleteTag = async (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`确定要删除标签 "${tagName}" 吗？`)) return

    try {
      await tagsApi.delete(tagName)
      await loadTags()
    } catch (error) {
      console.error('Failed to delete tag:', error)
      alert('删除标签失败')
    }
  }

  const handleTagClick = (tagName: string) => {
    if (onTagClick) {
      onTagClick(tagName)
    }
  }

  const maxCount = tags.length > 0 ? Math.max(...tags.map(t => t.count)) : 1

  const getTagSize = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.8) return 'text-lg font-bold'
    if (ratio > 0.5) return 'text-base font-medium'
    return 'text-sm'
  }

  const getTagColor = (count: number) => {
    const ratio = count / maxCount
    if (ratio > 0.8) return 'bg-primary-600 text-white hover:bg-primary-700'
    if (ratio > 0.5) return 'bg-primary-400 text-white hover:bg-primary-500'
    return 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">标签云</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-primary-600 hover:text-primary-700"
        >
          {showCreate ? '取消' : '+ 新建'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateTag} className="mb-3 flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="标签名称..."
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            创建
          </button>
        </form>
      )}

      {tags.length === 0 ? (
        <div className="text-xs text-gray-400">暂无标签</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.name}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer transition-colors ${getTagColor(tag.count)} ${getTagSize(tag.count)}`}
              onClick={() => handleTagClick(tag.name)}
            >
              <span>#{tag.name}</span>
              {tag.count > 0 && (
                <span className="text-xs opacity-80">({tag.count})</span>
              )}
              <button
                onClick={(e) => handleDeleteTag(tag.name, e)}
                className="ml-1 hover:text-red-200"
                aria-label="删除标签"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagCloud
