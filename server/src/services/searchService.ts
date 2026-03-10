import type { SearchResult, SearchParams } from '../types/index.js';
import { getAllNotes } from './noteService.js';

/**
 * 全文搜索服务（基于文件系统）
 */
export async function searchNotes(params: SearchParams): Promise<{
  query: string;
  total: number;
  results: SearchResult[];
}> {
  const { 
    q, 
    inTitle = true, 
    // inContent = true, // 暂时禁用内容搜索（NoteSummary 没有 content 字段）
    tags, 
    limit = 20, 
    offset = 0 
  } = params;
  
  const { notes: allNotes } = await getAllNotes();
  const lowerQuery = q.toLowerCase();
  
  // 过滤笔记
  // 注意：NoteSummary 没有 content 字段，需要读取文件内容才能搜索
  // 这里简化处理：只搜索标题和标签，内容搜索需要读取文件（性能开销大）
  let filtered = allNotes.filter(note => {
    const matchTitle = inTitle && note.title.toLowerCase().includes(lowerQuery);
    // NoteSummary 没有 content 字段，暂时跳过内容搜索
    const matchContent = false; // inContent && note.content && note.content.toLowerCase().includes(lowerQuery);
    const matchTags = tags && tags.length > 0 
      ? tags.some(tag => note.tags.some(nt => nt.toLowerCase().includes(tag.toLowerCase())))
      : true;
    
    return (matchTitle || matchContent) && matchTags;
  });
  
  // 生成搜索结果
  const results: SearchResult[] = filtered.slice(offset, offset + limit).map(note => ({
    id: note.id,
    title: note.title,
    path: note.path,
    excerpt: generateExcerpt(q, note.title),
    matchScore: 1.0,
    highlights: generateHighlights(q, note.title),
    tags: note.tags,
  }));
  
  return {
    query: q,
    total: filtered.length,
    results,
  };
}

/**
 * 生成搜索摘要
 */
function generateExcerpt(query: string, title: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  const index = lowerTitle.indexOf(lowerQuery);
  
  if (index >= 0) {
    const start = Math.max(0, index - 30);
    const end = Math.min(title.length, index + query.length + 30);
    
    let excerpt = title.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < title.length) excerpt = excerpt + '...';
    
    return excerpt;
  }
  
  return title.substring(0, 100) + (title.length > 100 ? '...' : '');
}

/**
 * 生成高亮位置
 */
function generateHighlights(query: string, title: string): Array<{ field: 'title' | 'content'; positions: [number, number][] }> {
  const positions: [number, number][] = [];
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  let startIndex = 0;
  while (true) {
    const index = lowerTitle.indexOf(lowerQuery, startIndex);
    if (index === -1) break;
    
    positions.push([index, index + query.length]);
    startIndex = index + 1;
  }
  
  return positions.length > 0 ? [{ field: 'title' as const, positions }] : [];
}

/**
 * 重建搜索索引（无数据库模式为 no-op）
 */
export async function rebuildSearchIndex(): Promise<number> {
  const { notes } = await getAllNotes();
  return notes.length;
}
