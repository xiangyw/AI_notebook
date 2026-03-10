export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  folderId?: string
  isFavorite?: boolean
  tags?: string[]
}

export interface Folder {
  id: string
  name: string
  icon: string
  parentId?: string
  noteCount?: number
}

export interface UIState {
  sidebarCollapsed: boolean
  editorMode: 'edit' | 'preview' | 'split'
  darkMode: boolean
  searchQuery: string
}

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved?: string
  error?: string
}

export interface NoteStore {
  // 笔记数据
  notes: Note[]
  folders: Folder[]
  selectedNoteId: string | null
  selectedFolderId: string | null
  
  // UI 状态
  uiState: UIState
  
  // 保存状态
  saveStatus: SaveStatus
  
  // Actions - 初始化
  loadNotes: () => Promise<void>
  
  // Actions - 笔记
  addNote: (note: Note) => Promise<void>
  updateNote: (note: Note) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  selectNote: (id: string) => void
  
  // Actions - 文件夹
  selectFolder: (id: string) => void
  moveNote: (noteId: string, targetFolderId: string) => Promise<void>
  
  // Actions - UI
  toggleSidebar: () => void
  setEditorMode: (mode: 'edit' | 'preview' | 'split') => void
  toggleDarkMode: () => void
  setSearchQuery: (query: string) => void
  
  // Actions - 保存状态
  setSaveStatus: (status: SaveStatus) => void
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface NotesApiResponse {
  notes: Note[]
  folders: Folder[]
}
