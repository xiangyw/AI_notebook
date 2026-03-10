import axios from 'axios'
import type { Note, ApiResponse, NotesApiResponse } from '../types'

// API 基础配置
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 笔记 API
export const notesApi = {
  // 获取所有笔记和文件夹
  getAll: async (): Promise<NotesApiResponse> => {
    try {
      const response = await api.get<ApiResponse<NotesApiResponse>>('/notes')
      return response.data.data!
    } catch (error) {
      console.error('Failed to fetch notes:', error)
      throw error
    }
  },

  // 获取单个笔记
  getById: async (id: string): Promise<Note> => {
    try {
      const response = await api.get<ApiResponse<Note>>(`/notes/${id}`)
      return response.data.data!
    } catch (error) {
      console.error('Failed to fetch note:', error)
      throw error
    }
  },

  // 创建笔记
  create: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    try {
      const response = await api.post<ApiResponse<Note>>('/notes', note)
      return response.data.data!
    } catch (error) {
      console.error('Failed to create note:', error)
      throw error
    }
  },

  // 更新笔记
  update: async (note: Note): Promise<Note> => {
    try {
      const response = await api.put<ApiResponse<Note>>(`/notes/${note.id}`, note)
      return response.data.data!
    } catch (error) {
      console.error('Failed to update note:', error)
      throw error
    }
  },

  // 删除笔记
  delete: async (id: string, permanent?: boolean): Promise<void> => {
    try {
      const url = permanent ? `/notes/${id}?permanent=true` : `/notes/${id}`
      await api.delete(url)
    } catch (error) {
      console.error('Failed to delete note:', error)
      throw error
    }
  },

  // 恢复笔记
  restore: async (id: string): Promise<Note> => {
    try {
      const response = await api.put<ApiResponse<Note>>(`/notes/${id}/restore`)
      return response.data.data!
    } catch (error) {
      console.error('Failed to restore note:', error)
      throw error
    }
  },

  // 收藏笔记
  favorite: async (id: string): Promise<Note> => {
    try {
      const response = await api.put<ApiResponse<Note>>(`/notes/${id}/favorite`)
      return response.data.data!
    } catch (error) {
      console.error('Failed to favorite note:', error)
      throw error
    }
  },

  // 取消收藏
  unfavorite: async (id: string): Promise<Note> => {
    try {
      const response = await api.delete<ApiResponse<Note>>(`/notes/${id}/favorite`)
      return response.data.data!
    } catch (error) {
      console.error('Failed to unfavorite note:', error)
      throw error
    }
  },

  // 搜索笔记
  search: async (query: string): Promise<{ query: string; total: number; results: any[] }> => {
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`)
      return response.data.data!
    } catch (error) {
      console.error('Failed to search notes:', error)
      throw error
    }
  },
}

// 文件夹 API
export const foldersApi = {
  // 获取所有文件夹
  getAll: async (): Promise<{ path: string; name: string; noteCount: number }[]> => {
    try {
      const response = await api.get<ApiResponse<{ folders: { path: string; name: string; noteCount: number }[] }>>('/folders')
      return response.data.data!.folders
    } catch (error) {
      console.error('Failed to fetch folders:', error)
      throw error
    }
  },

  // 创建文件夹
  create: async (folder: { path: string; name: string }): Promise<{ path: string; name: string; noteCount: number }> => {
    try {
      const response = await api.post<ApiResponse<{ folder: { path: string; name: string; noteCount: number } }>>('/folders', folder)
      return response.data.data!.folder
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  },

  // 更新文件夹
  update: async (path: string, name: string): Promise<void> => {
    try {
      await api.put(`/folders/${encodeURIComponent(path)}`, { name })
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  },

  // 删除文件夹
  delete: async (path: string): Promise<void> => {
    try {
      await api.delete(`/folders/${encodeURIComponent(path)}`)
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  },
}

// 标签 API
export interface TagInfo {
  name: string
  count: number
}

export const tagsApi = {
  // 获取所有标签
  getAll: async (): Promise<TagInfo[]> => {
    try {
      const response = await api.get<ApiResponse<{ tags: TagInfo[] }>>('/tags')
      return response.data.data!.tags
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      throw error
    }
  },

  // 创建标签
  create: async (name: string): Promise<TagInfo> => {
    try {
      const response = await api.post<ApiResponse<{ tag: TagInfo }>>('/tags', { name })
      return response.data.data!.tag
    } catch (error) {
      console.error('Failed to create tag:', error)
      throw error
    }
  },

  // 更新标签
  update: async (oldName: string, newName: string): Promise<void> => {
    try {
      await api.put(`/tags/${encodeURIComponent(oldName)}`, { name: newName })
    } catch (error) {
      console.error('Failed to update tag:', error)
      throw error
    }
  },

  // 删除标签
  delete: async (name: string): Promise<void> => {
    try {
      await api.delete(`/tags/${encodeURIComponent(name)}`)
    } catch (error) {
      console.error('Failed to delete tag:', error)
      throw error
    }
  },
}

export default api
