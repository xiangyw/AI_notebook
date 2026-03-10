import * as fs from 'fs/promises';
import * as path from 'path';
import config from '../config/index.js';

export interface AutoSaveEntry {
  id: string;
  content: string;
  timestamp: Date;
}

/**
 * 自动保存服务
 * 
 * 功能：
 * 1. 定期保存编辑中的笔记到临时文件
 * 2. 崩溃恢复时从临时文件恢复
 * 3. 防止数据丢失
 */
class AutoSaveService {
  private autoSaveDir: string;
  private saveInterval: number;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private pendingSaves: Map<string, AutoSaveEntry> = new Map();

  constructor() {
    this.autoSaveDir = path.join(config.dataDir, 'autosave');
    this.saveInterval = parseInt(process.env.AUTO_SAVE_INTERVAL || '30000', 10); // 默认 30 秒
  }

  /**
   * 初始化自动保存服务
   */
  async init(): Promise<void> {
    await fs.mkdir(this.autoSaveDir, { recursive: true });
    console.log(`💾 自动保存已初始化：${this.autoSaveDir}`);
    console.log(`⏱️  保存间隔：${this.saveInterval}ms`);
  }

  /**
   * 开始自动保存笔记
   */
  startAutoSave(noteId: string, content: string): void {
    // 清除之前的定时器
    this.stopAutoSave(noteId);

    // 添加到待保存队列
    this.pendingSaves.set(noteId, {
      id: noteId,
      content,
      timestamp: new Date(),
    });

    // 设置定时器
    const timer = setTimeout(() => {
      this.performAutoSave(noteId);
    }, this.saveInterval);

    this.timers.set(noteId, timer);
  }

  /**
   * 停止自动保存
   */
  stopAutoSave(noteId: string): void {
    const timer = this.timers.get(noteId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(noteId);
    }
  }

  /**
   * 执行自动保存
   */
  private async performAutoSave(noteId: string): Promise<void> {
    const entry = this.pendingSaves.get(noteId);
    if (!entry) {
      return;
    }

    try {
      const filePath = path.join(this.autoSaveDir, `${noteId}.autosave`);
      const data = JSON.stringify({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      });

      await fs.writeFile(filePath, data, 'utf-8');
      console.log(`💾 自动保存：${noteId}`);
    } catch (error) {
      console.error(`❌ 自动保存失败：${noteId}`, error);
    }
  }

  /**
   * 立即保存并清除
   */
  async flush(noteId: string): Promise<boolean> {
    const entry = this.pendingSaves.get(noteId);
    if (!entry) {
      return false;
    }

    try {
      const filePath = path.join(this.autoSaveDir, `${noteId}.autosave`);
      const data = JSON.stringify({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      });

      await fs.writeFile(filePath, data, 'utf-8');
      this.pendingSaves.delete(noteId);
      this.stopAutoSave(noteId);
      
      console.log(`✅ 笔记已保存：${noteId}`);
      return true;
    } catch (error) {
      console.error(`❌ 保存失败：${noteId}`, error);
      return false;
    }
  }

  /**
   * 恢复未保存的笔记
   */
  async recoverUnsavedNotes(): Promise<AutoSaveEntry[]> {
    try {
      const files = await fs.readdir(this.autoSaveDir);
      const autosaveFiles = files.filter(f => f.endsWith('.autosave'));
      
      const recovered: AutoSaveEntry[] = [];

      for (const file of autosaveFiles) {
        try {
          const filePath = path.join(this.autoSaveDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const entry: AutoSaveEntry = JSON.parse(content);
          
          entry.timestamp = new Date(entry.timestamp as any);
          recovered.push(entry);
          
          console.log(`🔄 可恢复笔记：${entry.id} (${entry.timestamp.toISOString()})`);
        } catch (error) {
          console.warn(`无法恢复文件 ${file}:`, error);
        }
      }

      return recovered;
    } catch (error) {
      console.error('读取自动保存目录失败:', error);
      return [];
    }
  }

  /**
   * 清理已保存的临时文件
   */
  async cleanup(noteId: string): Promise<void> {
    try {
      const filePath = path.join(this.autoSaveDir, `${noteId}.autosave`);
      await fs.unlink(filePath);
      console.log(`🧹 已清理自动保存：${noteId}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn(`清理自动保存文件失败：${noteId}`, error);
      }
    }
  }

  /**
   * 停止所有自动保存
   */
  async stopAll(): Promise<void> {
    // 保存所有待保存的笔记
    const promises = Array.from(this.pendingSaves.keys()).map(id => this.flush(id));
    await Promise.all(promises);

    // 清除所有定时器
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.pendingSaves.clear();

    console.log('✅ 所有自动保存已停止');
  }

  /**
   * 获取自动保存状态
   */
  getStatus(): { 
    pendingCount: number; 
    activeTimers: number;
    directory: string 
  } {
    return {
      pendingCount: this.pendingSaves.size,
      activeTimers: this.timers.size,
      directory: this.autoSaveDir,
    };
  }
}

// 导出单例
export const autoSaveService = new AutoSaveService();
export default autoSaveService;
