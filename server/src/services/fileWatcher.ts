import chokidar from 'chokidar';
import config from '../config/index.js';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  filePath: string;
  timestamp: Date;
}

/**
 * 文件监控服务
 */
class FileWatcherService extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private isWatching = false;
  private notesDir: string;

  constructor() {
    super();
    this.notesDir = path.join(config.dataDir, 'notes');
  }

  /**
   * 启动文件监控
   */
  start(): void {
    if (this.isWatching) {
      console.log('⚠️  文件监控已在运行');
      return;
    }

    console.log('👁️  启动文件监控...');
    console.log(`📁 监控目录：${this.notesDir}`);

    this.watcher = chokidar.watch(this.notesDir, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 10,
      },
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    });

    this.watcher
      .on('add', (filePath) => {
        console.log(`📄 文件创建：${path.relative(this.notesDir, filePath)}`);
        this.emit('change', {
          type: 'add',
          filePath,
          timestamp: new Date(),
        });
      })
      .on('change', (filePath) => {
        console.log(`✏️  文件修改：${path.relative(this.notesDir, filePath)}`);
        this.emit('change', {
          type: 'change',
          filePath,
          timestamp: new Date(),
        });
      })
      .on('unlink', (filePath) => {
        console.log(`🗑️  文件删除：${path.relative(this.notesDir, filePath)}`);
        this.emit('change', {
          type: 'unlink',
          filePath,
          timestamp: new Date(),
        });
      })
      .on('error', (error) => {
        console.error('❌ 文件监控错误:', error);
        this.emit('error', error);
      });

    this.isWatching = true;
    console.log('✅ 文件监控已启动');
  }

  /**
   * 停止文件监控
   */
  async stop(): Promise<void> {
    if (!this.watcher || !this.isWatching) {
      return;
    }

    console.log('🛑 停止文件监控...');
    await this.watcher.close();
    this.watcher = null;
    this.isWatching = false;
    console.log('✅ 文件监控已停止');
  }

  /**
   * 获取监控状态
   */
  getStatus(): { isWatching: boolean; directory: string } {
    return {
      isWatching: this.isWatching,
      directory: this.notesDir,
    };
  }

  /**
   * 添加事件监听
   */
  onChange(callback: (event: FileChangeEvent) => void): void {
    this.on('change', callback);
  }

  /**
   * 移除事件监听
   */
  offChange(callback: (event: FileChangeEvent) => void): void {
    this.off('change', callback);
  }
}

// 导出单例
export const fileWatcher = new FileWatcherService();
export default fileWatcher;
