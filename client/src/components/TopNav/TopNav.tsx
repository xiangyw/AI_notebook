import { useNoteStore } from '../../stores/noteStore'
import SearchBar from '../SearchBar/SearchBar'

interface TopNavProps {
  onCreateNote: () => void
}

function TopNav({ onCreateNote }: TopNavProps) {
  const { uiState, toggleSidebar, toggleDarkMode } = useNoteStore()

  return (
    <header className="h-nav bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* 左侧：Logo + 汉堡菜单 + 搜索 */}
      <div className="flex items-center gap-4 flex-1">
        {/* 汉堡菜单 - 移动端和折叠侧边栏时使用 */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">📒</span>
          <span className="text-xl font-bold text-gray-800 hidden sm:block">Notebook</span>
        </div>

        {/* 搜索框 */}
        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>
      </div>

      {/* 右侧：功能按钮 */}
      <div className="flex items-center gap-2">
        {/* 新建笔记按钮 */}
        <button
          onClick={onCreateNote}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium
                     hover:bg-primary-600 active:bg-primary-700
                     transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">新建</span>
        </button>

        {/* 分割线 */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* 暗黑模式切换 */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle dark mode"
          title={uiState.darkMode ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {uiState.darkMode ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* 设置按钮 */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Settings"
          title="设置"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* 用户头像（预留） */}
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center ml-2">
          <span className="text-sm font-medium text-primary-700">U</span>
        </div>
      </div>
    </header>
  )
}

export default TopNav
