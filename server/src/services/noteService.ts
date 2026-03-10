import config from '../config/index.js';
import type { 
  Note, 
  CreateNoteInput, 
  UpdateNoteInput, 
  FolderInfo,
  ListQueryParams 
} from '../types/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import dayjs from 'dayjs';

// Front Matter 解析（简单的 YAML 解析）
function parseFrontMatter(content: string): { frontMatter: Record<string, any>; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { frontMatter: {}, body: content };
  }
  
  const frontMatterStr = match[1];
  const body = match[2];
  
  const frontMatter: Record<string, any> = {};
  const lines = frontMatterStr.split('\n');
  
  let currentKey: string | null = null;
  let currentArray: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    if (trimmedLine.startsWith('- ')) {
      if (currentKey) {
        currentArray.push(trimmedLine.substring(2).trim());
      }
      continue;
    }
    
    if (currentKey && currentArray.length > 0) {
      frontMatter[currentKey] = currentArray;
      currentArray = [];
    }
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      currentKey = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();
      
      if (value) {
        frontMatter[currentKey] = value;
        currentKey = null;
      }
    }
  }
  
  if (currentKey && currentArray.length > 0) {
    frontMatter[currentKey] = currentArray;
  }
  
  return { frontMatter, body };
}

// 生成 Front Matter
function generateFrontMatter(note: Partial<Note>): string {
  const frontMatter: Record<string, any> = {
    id: note.id,
    title: note.title,
    createdAt: note.createdAt?.toISOString(),
    updatedAt: note.updatedAt?.toISOString(),
  };
  
  if (note.tags && note.tags.length > 0) {
    frontMatter.tags = note.tags;
  }
  
  let yaml = '---\n';
  for (const [key, value] of Object.entries(frontMatter)) {
    if (Array.isArray(value)) {
      yaml += `${key}:\n`;
      for (const item of value) {
        yaml += `  - ${item}\n`;
      }
    } else {
      yaml += `${key}: ${value}\n`;
    }
  }
  yaml += '---\n\n';
  
  return yaml;
}

// 生成笔记 ID
function generateNoteId(): string {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${date}-${random}`;
}

// 计算字数
function countWords(content: string): number {
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = content.match(/[a-zA-Z]+/g) || [];
  return chineseChars.length + englishWords.length;
}

// 获取笔记文件路径
function getNoteFilePath(notePath: string): string {
  return path.join(config.dataDir, 'notes', notePath);
}

/**
 * 创建笔记
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const id = input.path ? path.basename(input.path, '.md') : generateNoteId();
  const notePath = input.path || `${id}.md`;
  
  const fullPath = getNoteFilePath(notePath);
  try {
    await fs.access(fullPath);
    throw new Error('笔记已存在');
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
  
  const now = new Date();
  const tags = input.tags || [];
  
  const noteData: Partial<Note> = {
    id,
    title: input.title,
    content: input.content,
    tags,
    createdAt: now,
    updatedAt: now,
  };
  
  const frontMatter = generateFrontMatter(noteData);
  const fullContent = frontMatter + input.content;
  
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, fullContent, 'utf-8');
  
  const wordCount = countWords(input.content);
  
  return {
    id,
    title: input.title,
    content: input.content,
    path: notePath,
    tags,
    createdAt: now,
    updatedAt: now,
    wordCount,
  };
}

/**
 * 从文件系统获取笔记列表
 */
async function getAllNotesFromFiles(params: ListQueryParams = {}): Promise<{ notes: Note[]; folders: FolderInfo[] }> {
  const { sortBy = 'updatedAt', sortOrder = 'desc' } = params;
  const notesDir = path.join(config.dataDir, 'notes');
  
  const notes: Note[] = [];
  const folderSet = new Set<string>();
  
  try {
    const files = await fs.readdir(notesDir, { recursive: true });
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const fullPath = path.join(notesDir, file);
      const stat = await fs.stat(fullPath);
      
      if (!stat.isFile()) continue;
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const { frontMatter, body } = parseFrontMatter(content);
        
        const folder = path.dirname(file);
        if (folder !== '.') folderSet.add(folder);
        
        notes.push({
          id: frontMatter.id || path.basename(file, '.md'),
          title: frontMatter.title || path.basename(file, '.md'),
          content: body, // ← 修复：添加 content 字段
          path: file,
          tags: frontMatter.tags || [],
          createdAt: frontMatter.createdAt ? new Date(frontMatter.createdAt) : stat.birthtime,
          updatedAt: frontMatter.updatedAt ? new Date(frontMatter.updatedAt) : stat.mtime,
          wordCount: countWords(body),
        });
      } catch (err) {
        console.warn(`无法读取文件 ${file}:`, err);
      }
    }
    
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 1 : -1;
    notes.sort((a, b) => {
      let aVal: any = a[sortBy === 'updatedAt' ? 'updatedAt' : sortBy === 'createdAt' ? 'createdAt' : 'title'];
      let bVal: any = b[sortBy === 'updatedAt' ? 'updatedAt' : sortBy === 'createdAt' ? 'createdAt' : 'title'];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (aVal < bVal) return -1 * orderDirection;
      if (aVal > bVal) return 1 * orderDirection;
      return 0;
    });
    
    const folders: FolderInfo[] = Array.from(folderSet).map(folderPath => ({
      name: path.basename(folderPath),
      path: folderPath,
      noteCount: notes.filter(n => n.path.startsWith(folderPath)).length,
    }));
    
    return { notes, folders };
  } catch (err) {
    console.error('读取笔记目录失败:', err);
    return { notes: [], folders: [] };
  }
}

/**
 * 获取所有笔记
 */
export async function getAllNotes(params: ListQueryParams = {}): Promise<{ notes: Note[]; folders: FolderInfo[] }> {
  return getAllNotesFromFiles(params);
}

/**
 * 从文件系统根据 ID 获取笔记
 */
async function getNoteByIdFromFiles(id: string): Promise<Note | null> {
  const notesDir = path.join(config.dataDir, 'notes');
  
  try {
    const files = await fs.readdir(notesDir, { recursive: true });
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const fullPath = path.join(notesDir, file);
      const stat = await fs.stat(fullPath);
      
      if (!stat.isFile()) continue;
      
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const { frontMatter, body } = parseFrontMatter(content);
        
        if (frontMatter.id === id) {
          return {
            id: frontMatter.id,
            title: frontMatter.title,
            content: body,
            path: file,
            tags: frontMatter.tags || [],
            createdAt: frontMatter.createdAt ? new Date(frontMatter.createdAt) : stat.birthtime,
            updatedAt: frontMatter.updatedAt ? new Date(frontMatter.updatedAt) : stat.mtime,
            wordCount: countWords(body),
          };
        }
      } catch (err) {
        // 继续查找
      }
    }
    
    return null;
  } catch (err) {
    console.error('读取笔记目录失败:', err);
    return null;
  }
}

/**
 * 根据 ID 获取笔记
 */
export async function getNoteById(id: string): Promise<Note | null> {
  return getNoteByIdFromFiles(id);
}

/**
 * 根据路径获取笔记
 */
export async function getNoteByPath(notePath: string): Promise<Note | null> {
  const fullPath = getNoteFilePath(notePath);
  
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    const stat = await fs.stat(fullPath);
    const { frontMatter, body } = parseFrontMatter(content);
    
    return {
      id: frontMatter.id || path.basename(notePath, '.md'),
      title: frontMatter.title,
      content: body,
      path: notePath,
      tags: frontMatter.tags || [],
      createdAt: frontMatter.createdAt ? new Date(frontMatter.createdAt) : stat.birthtime,
      updatedAt: frontMatter.updatedAt ? new Date(frontMatter.updatedAt) : stat.mtime,
      wordCount: countWords(body),
    };
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/**
 * 更新笔记
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note | null> {
  const existingNote = await getNoteById(id);
  if (!existingNote) {
    return null;
  }
  
  const now = new Date();
  const updatedNote: Partial<Note> = {
    ...existingNote,
    updatedAt: now,
  };
  
  if (input.title !== undefined) updatedNote.title = input.title;
  if (input.content !== undefined) updatedNote.content = input.content;
  if (input.tags !== undefined) updatedNote.tags = input.tags;
  
  // 处理文件夹变更（文件系统模式：通过路径实现）
  let targetPath = input.path || existingNote.path;
  const folderId = (input as any).folderId;
  
  if (folderId) {
    const fileName = path.basename(existingNote.path);
    targetPath = folderId ? path.join(folderId, fileName) : fileName;
  }
  
  if (targetPath !== existingNote.path) {
    const oldPath = getNoteFilePath(existingNote.path);
    const newPath = getNoteFilePath(targetPath);
    
    await fs.mkdir(path.dirname(newPath), { recursive: true });
    await fs.rename(oldPath, newPath);
    
    updatedNote.path = targetPath;
  }
  
  const finalTitle = updatedNote.title ?? existingNote.title;
  const finalContent = updatedNote.content ?? existingNote.content;
  const finalPath = updatedNote.path ?? targetPath;
  const finalTags = updatedNote.tags ?? existingNote.tags;
  
  const frontMatter = generateFrontMatter({ ...updatedNote, title: finalTitle, content: finalContent, path: finalPath, tags: finalTags });
  const fullContent = frontMatter + finalContent;
  const fullPath = getNoteFilePath(finalPath);
  
  await fs.writeFile(fullPath, fullContent, 'utf-8');
  
  const wordCount = countWords(finalContent);
  
  return {
    id,
    title: finalTitle,
    content: finalContent,
    path: finalPath,
    tags: finalTags,
    createdAt: existingNote.createdAt,
    updatedAt: now,
    wordCount,
  };
}

/**
 * 删除笔记
 */
export async function deleteNote(id: string): Promise<boolean> {
  const note = await getNoteById(id);
  if (!note) {
    return false;
  }
  
  const fullPath = getNoteFilePath(note.path);
  try {
    await fs.unlink(fullPath);
    return true;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

/**
 * 搜索笔记
 */
export async function searchNotes(query: string, limit: number = 20): Promise<any[]> {
  const { notes } = await getAllNotes();
  const lowerQuery = query.toLowerCase();
  
  const results = notes
    .filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
    .slice(0, limit)
    .map(note => ({
      ...note,
      matchScore: 1.0,
    }));
  
  return results;
}
