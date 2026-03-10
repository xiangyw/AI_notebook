import { create } from 'zustand'
import type { Note, Folder, NoteStore, UIState, SaveStatus } from '../types'
import { notesApi } from '../services/api'

// 默认文件夹
const defaultFolders: Folder[] = [
  { id: 'all', name: '全部笔记', icon: '📝', noteCount: 0 },
  { id: 'work', name: '工作', icon: '📁', noteCount: 0 },
  { id: 'personal', name: '个人', icon: '📁', noteCount: 0 },
  { id: 'study', name: '学习', icon: '📁', noteCount: 0 },
  { id: 'favorites', name: '收藏夹', icon: '⭐', noteCount: 0 },
  { id: 'trash', name: '回收站', icon: '🗑️', noteCount: 0 },
]

// 初始示例笔记
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Notebook',
    content: '# Welcome to Notebook! 📒\n\nThis is your new notebook. Start creating notes to organize your thoughts.\n\n## Features\n\n- **Markdown Support** - Write in Markdown with live preview\n- **Folder Organization** - Organize notes into folders\n- **Search** - Quickly find your notes\n- **Auto-save** - Your work is automatically saved\n\nEnjoy!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    folderId: 'personal',
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Meeting Notes - Project Kickoff',
    content: '# Project Kickoff Meeting\n\n**Date:** 2024-01-15\n**Attendees:** Team A, Team B\n\n## Agenda\n\n1. Project overview\n2. Timeline discussion\n3. Resource allocation\n\n## Action Items\n\n- [ ] Set up project repository\n- [ ] Schedule follow-up meetings\n- [ ] Assign initial tasks\n\n## Notes\n\nThe team discussed the project scope and agreed on the initial timeline...',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    folderId: 'work',
  },
  {
    id: '3',
    title: 'React Learning Notes',
    content: '# React Study Notes\n\n## Core Concepts\n\n### Components\n\n```jsx\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>\n}\n```\n\n### Hooks\n\n- `useState` - State management\n- `useEffect` - Side effects\n- `useContext` - Context API\n- `useReducer` - Complex state\n\n## Best Practices\n\n1. Keep components small and focused\n2. Use proper naming conventions\n3. Follow the single responsibility principle\n',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    folderId: 'study',
  },
  {
    id: '4',
    title: 'Shopping List',
    content: '# Shopping List\n\n## Groceries\n\n- [ ] Milk\n- [ ] Eggs\n- [ ] Bread\n- [ ] Vegetables\n- [ ] Fruits\n\n## Other\n\n- [ ] Notebook\n- [ ] Pens\n',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    folderId: 'personal',
  },
]

// 默认 UI 状态
const defaultUIState: UIState = {
  sidebarCollapsed: false,
  editorMode: 'split', // 'edit' | 'preview' | 'split'
  darkMode: false,
  searchQuery: '',
}

// 默认保存状态
const defaultSaveStatus: SaveStatus = {
  status: 'idle',
}

export const useNoteStore = create<NoteStore>((set) => ({
  // 初始状态
  notes: initialNotes,
  folders: defaultFolders,
  selectedNoteId: null,
  selectedFolderId: 'all',
  uiState: defaultUIState,
  saveStatus: defaultSaveStatus,

  // 初始化：从后端加载笔记
  loadNotes: async () => {
    try {
      const { notes, folders } = await notesApi.getAll()
      // 后端返回的笔记列表没有 content，需要从路径推断 folderId
      const notesWithContent = notes.map((note: any) => {
        // 从路径推断 folderId（文件系统模式）
        const pathParts = (note as any).path?.split('/') || []
        const folderId = pathParts.length > 1 ? pathParts[0] : undefined
        
        return {
          ...note,
          content: (note as any).content || '',
          folderId,
          isFavorite: (note as any).isFavorite || false,
        }
      })
      
      // 转换 folders 格式以匹配前端
      const foldersWithIds = (folders as any[]).map((f: any) => ({
        id: f.path,
        name: f.name,
        icon: '📁',
        noteCount: f.noteCount,
      }))
      
      set({ notes: notesWithContent, folders: [...defaultFolders, ...foldersWithIds] })
    } catch (error) {
      console.error('Failed to load notes:', error)
      // 加载失败时保留初始笔记（离线模式）
    }
  },

  // 笔记 Actions
  addNote: async (note: Note) => {
    // 生成临时 ID，确保编辑器立即可用
    const tempId = `temp-${Date.now()}`
    const tempNote: Note = {
      ...note,
      id: tempId,
      title: note.title || '无标题笔记',
      content: note.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // 先本地创建，让用户可以立即开始编辑
    set((state) => ({
      notes: [tempNote, ...state.notes],
      selectedNoteId: tempId,
      saveStatus: { status: 'saving' },
    }))
    
    try {
      // 等待一小段时间，让用户可以开始输入
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 获取用户可能已编辑的内容
      let userTitle = tempNote.title
      let userContent = tempNote.content
      
      // 异步调用 API 创建笔记
      const createdNote = await notesApi.create({
        title: userTitle,
        content: userContent,
      })
      
      // 用后端返回的真实笔记替换临时笔记
      // 保留用户可能已编辑的内容（从临时笔记中获取）
      set((state) => {
        const updatedTempNote = state.notes.find(n => n.id === tempId)
        const finalNote = updatedTempNote ? {
          ...createdNote,
          title: updatedTempNote.title,
          content: updatedTempNote.content,
        } : createdNote
        
        return {
          notes: state.notes.map((n) => n.id === tempId ? finalNote : n),
          selectedNoteId: finalNote.id,
          saveStatus: { status: 'saved', lastSaved: new Date().toISOString() },
        }
      })
    } catch (error) {
      console.error('Failed to create note:', error)
      set({
        saveStatus: {
          status: 'error',
          error: '创建失败，请检查网络连接',
        },
      })
      // 移除失败的临时笔记
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== tempId),
        selectedNoteId: state.selectedNoteId === tempId ? null : state.selectedNoteId,
      }))
      throw error
    }
  },

  updateNote: async (note: Note) => {
    // 如果是临时 ID，跳过 API 调用（等待 addNote 完成）
    if (note.id.startsWith('temp-')) {
      // 只更新本地状态
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === note.id ? { ...note, updatedAt: new Date().toISOString() } : n
        ),
        saveStatus: { status: 'saved', lastSaved: new Date().toISOString() },
      }))
      return
    }
    
    // 设置保存中状态
    set({ saveStatus: { status: 'saving' } })
    
    try {
      // 调用 API 保存到后端（包含 folderId）
      const savedNote = await notesApi.update({
        ...note,
        updatedAt: new Date().toISOString(),
      })
      
      // 本地更新
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === note.id ? savedNote : n
        ),
        saveStatus: {
          status: 'saved',
          lastSaved: new Date().toISOString(),
        },
      }))
    } catch (error) {
      console.error('Failed to save note:', error)
      set({
        saveStatus: {
          status: 'error',
          error: '保存失败，请检查网络连接',
        },
      })
      throw error
    }
  },

  // 移动笔记到文件夹
  moveNote: async (noteId: string, folderId: string) => {
    try {
      const note = useNoteStore.getState().notes.find(n => n.id === noteId)
      if (!note) return
      
      // 调用 API 更新笔记（包含 folderId）
      const savedNote = await notesApi.update({
        ...note,
        folderId,
        updatedAt: new Date().toISOString(),
      })
      
      // 更新本地状态，触发列表刷新
      set((state) => ({
        notes: state.notes.map((n) => n.id === noteId ? savedNote : n),
      }))
      
      // 如果当前选中的文件夹不是目标文件夹，且笔记在当前列表中，需要刷新列表
      const currentFolderId = useNoteStore.getState().selectedFolderId
      if (currentFolderId !== folderId && currentFolderId !== 'all') {
        // 笔记被移动到其他文件夹，从当前列表移除（状态更新已处理）
      }
    } catch (error) {
      console.error('Failed to move note:', error)
      throw error
    }
  },

  deleteNote: async (id: string) => {
    try {
      // 调用 API 删除
      await notesApi.delete(id)
      
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      }))
    } catch (error) {
      console.error('Failed to delete note:', error)
      throw error
    }
  },

  selectNote: (id: string) => {
    set({ selectedNoteId: id })
  },

  // 文件夹 Actions
  selectFolder: (id: string) => {
    set({ selectedFolderId: id, selectedNoteId: null })
  },

  // 移动笔记到文件夹 - 修复 Bug #4: 拖拽笔记到文件夹后自动刷新列表
  moveNote: async (noteId: string, targetFolderId: string) => {
    try {
      // 先从当前状态获取笔记
      let note: Note | undefined
      set((state) => {
        note = state.notes.find((n) => n.id === noteId)
        return {}
      })
      
      if (!note) {
        throw new Error(`Note ${noteId} not found`)
      }
      
      // 调用 API 更新笔记的文件夹
      const updatedNote = await notesApi.update({
        ...note,
        folderId: targetFolderId,
        updatedAt: new Date().toISOString(),
      })
      
      // 本地更新状态 - 这会触发 React 组件重新渲染
      // 注意：set() 调用会通知 Zustand 状态已变更，所有订阅该 store 的组件会自动重新渲染
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === noteId ? updatedNote : n
        ),
        saveStatus: {
          status: 'saved',
          lastSaved: new Date().toISOString(),
        },
      }))
    } catch (error) {
      console.error('Failed to move note:', error)
      set({
        saveStatus: {
          status: 'error',
          error: '移动失败，请检查网络连接',
        },
      })
      throw error
    }
  },

  // UI Actions
  toggleSidebar: () => {
    set((state) => ({
      uiState: {
        ...state.uiState,
        sidebarCollapsed: !state.uiState.sidebarCollapsed,
      },
    }))
  },

  setEditorMode: (mode: 'edit' | 'preview' | 'split') => {
    set((state) => ({
      uiState: {
        ...state.uiState,
        editorMode: mode,
      },
    }))
  },

  toggleDarkMode: () => {
    set((state) => ({
      uiState: {
        ...state.uiState,
        darkMode: !state.uiState.darkMode,
      },
    }))
  },

  setSearchQuery: (query: string) => {
    set((state) => ({
      uiState: {
        ...state.uiState,
        searchQuery: query,
      },
    }))
  },

  // 保存状态 Action
  setSaveStatus: (status: SaveStatus) => {
    set({ saveStatus: status })
  },
}))

// 辅助函数：获取过滤后的笔记列表
export const getFilteredNotes = (
  notes: Note[],
  selectedFolderId: string | null,
  searchQuery: string
): Note[] => {
  let filtered = notes

  // 按文件夹过滤
  if (selectedFolderId === 'favorites') {
    filtered = notes.filter((n) => n.isFavorite)
  } else if (selectedFolderId === 'trash') {
    // TODO: 实现回收站逻辑
    filtered = []
  } else if (selectedFolderId && selectedFolderId !== 'all') {
    filtered = notes.filter((n) => n.folderId === selectedFolderId)
  }

  // 按搜索查询过滤
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
    )
  }

  return filtered
}
