// 笔记服务
export {
  createNote,
  getAllNotes,
  getNoteById,
  getNoteByPath,
  updateNote,
  deleteNote,
  searchNotes,
} from './noteService.js';

// 搜索服务
export { searchNotes as searchNotesFull, rebuildSearchIndex } from './searchService.js';

// 元数据服务
export { getStats, getAllTags, getAllFolders, getTagByName, cleanupUnusedTags } from './metaService.js';

// 文件服务
export { fileWatcher } from './fileWatcher.js';
export type { FileChangeEvent } from './fileWatcher.js';
export { autoSaveService } from './autoSave.js';
export type { AutoSaveEntry } from './autoSave.js';
