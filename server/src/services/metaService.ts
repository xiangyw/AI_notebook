import type { Stats, TagInfo, FolderInfo } from '../types/index.js';
import { getAllNotes } from './noteService.js';

/**
 * 获取统计信息
 */
export async function getStats(): Promise<Stats> {
  const { notes, folders } = await getAllNotes();
  
  const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
  const lastUpdated = notes.length > 0 
    ? notes.reduce((latest, note) => note.updatedAt > latest ? note.updatedAt : latest, notes[0].updatedAt)
    : new Date();
  
  return {
    totalNotes: notes.length,
    totalFolders: folders.length,
    totalWords,
    lastUpdated,
  };
}

/**
 * 获取所有标签
 */
export async function getAllTags(): Promise<TagInfo[]> {
  const { notes } = await getAllNotes();
  
  const tagMap = new Map<string, number>();
  
  for (const note of notes) {
    for (const tag of note.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  
  const tags: TagInfo[] = Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  
  return tags;
}

/**
 * 获取所有文件夹
 */
export async function getAllFolders(): Promise<FolderInfo[]> {
  const { folders } = await getAllNotes();
  return folders;
}

/**
 * 获取单个标签的详细信息
 */
export async function getTagByName(name: string): Promise<TagInfo | null> {
  const tags = await getAllTags();
  return tags.find(t => t.name === name) || null;
}

/**
 * 删除未使用的标签（无数据库模式为 no-op）
 */
export async function cleanupUnusedTags(): Promise<number> {
  return 0;
}
