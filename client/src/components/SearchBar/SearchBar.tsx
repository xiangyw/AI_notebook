import { useState, useEffect, useRef } from 'react'
import { useNoteStore } from '../../stores/noteStore'
import { getFilteredNotes } from '../../stores/noteStore'

function SearchBar() {
  const { notes, uiState, setSearchQuery, selectedFolderId } = useNoteStore()
  const [localQuery, setLocalQuery] = useState(uiState.searchQuery)
  const [isFocused, setIsFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredNotes = getFilteredNotes(notes, selectedFolderId, localQuery)

  // 防抖搜索
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setSearchQuery(localQuery)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [localQuery, setSearchQuery])

  // 显示搜索结果数量
  const showResults = isFocused && localQuery.length > 0
  const resultCount = showResults ? filteredNotes.length : 0

  const handleClear = () => {
    setLocalQuery('')
    setSearchQuery('')
  }

  return (
    <div className="relative">
      {/* 搜索输入框 */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          isFocused
            ? 'border-primary-500 ring-2 ring-primary-100 bg-white'
            : 'border-gray-300 bg-gray-50 hover:bg-white'
        }`}
      >
        {/* 搜索图标 */}
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* 输入框 */}
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="🔍 搜索笔记..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
        />

        {/* 清除按钮 */}
        {localQuery && (
          <button
            onClick={handleClear}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 搜索结果提示 */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-1 text-xs text-gray-500">
            找到 {resultCount} 个结果
          </div>
          {resultCount > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {filteredNotes.slice(0, 5).map((note) => (
                <div
                  key={note.id}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="text-sm font-medium text-gray-800 truncate">{note.title}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {note.content.substring(0, 50) || '无内容'}
                  </div>
                </div>
              ))}
            </div>
          )}
          {resultCount === 0 && (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              未找到匹配的笔记
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
