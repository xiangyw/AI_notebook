import { useEffect } from 'react'
import { useNoteStore } from './stores/noteStore'
import TopNav from './components/TopNav/TopNav'
import FolderTree from './components/FolderTree/FolderTree'
import NoteList from './components/NoteList/NoteList'
import Editor from './components/Editor/Editor'
import StatusBar from './components/StatusBar/StatusBar'
import TagCloud from './components/TagCloud/TagCloud'

function App() {
  const { addNote, uiState, loadNotes } = useNoteStore()

  // 应用启动时加载笔记
  useEffect(() => {
    loadNotes()
  }, [])

  // 创建新笔记
  const handleCreateNote = async () => {
    const newNote = {
      id: Date.now().toString(),
      title: '无标题笔记',
      content: '# 无标题笔记\n\n开始记录你的想法...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderId: undefined,
      isFavorite: false,
      tags: [],
    }
    try {
      await addNote(newNote)
    } catch (error) {
      console.error('Failed to create note:', error)
      alert('创建笔记失败，请检查网络连接')
    }
  }

  return (
    <div className={`h-screen flex flex-col ${uiState.darkMode ? 'dark' : ''}`}>
      {/* 顶部导航栏 */}
      <TopNav onCreateNote={handleCreateNote} />

      {/* 主体内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        <aside
          className={`w-sidebar bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 ${
            uiState.sidebarCollapsed ? '-ml-sidebar' : 'ml-0'
          } lg:ml-0`}
        >
          {/* 文件夹导航 */}
          <FolderTree />

          {/* 分割线 */}
          <hr className="border-gray-200 mx-4" />

          {/* 笔记列表 */}
          <NoteList />

          {/* 分割线 */}
          <hr className="border-gray-200 mx-4 mt-auto" />

          {/* 标签云 */}
          <TagCloud />
        </aside>

        {/* 主编辑区 */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <Editor />
        </main>
      </div>

      {/* 底部状态栏 */}
      <StatusBar />
    </div>
  )
}

export default App
