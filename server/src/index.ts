import createApp from './app.js';
import config from './config/index.js';
import { fileWatcher, autoSaveService } from './services/index.js';
import { testConnection, initializeDatabase } from './database/db.js';
import * as fs from 'fs/promises';
import * as path from 'path';

async function main() {
  console.log('🚀 正在启动 Notebook 服务器...');
  console.log(`📦 环境：${config.env}`);
  console.log(`🔌 端口：${config.port}`);
  console.log(`📁 数据目录：${config.dataDir}`);

  // 确保数据目录存在
  await fs.mkdir(path.join(config.dataDir, 'notes'), { recursive: true });
  console.log('✅ 数据目录已准备');

  // 测试并初始化数据库连接
  console.log('🔌 正在连接数据库...');
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('✅ 数据库连接成功');
    await initializeDatabase();
  } else {
    console.log('ℹ️  无数据库模式：使用文件系统存储');
  }

  // 创建并启动应用
  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log('\n✅ 服务器已启动');
    console.log(`🌐 访问地址：http://localhost:${config.port}`);
    console.log(`📝 API 端点:`);
    console.log(`   - GET    /api/notes        获取笔记列表`);
    console.log(`   - GET    /api/notes/:id    获取单篇笔记`);
    console.log(`   - POST   /api/notes        创建笔记`);
    console.log(`   - PUT    /api/notes/:id    更新笔记`);
    console.log(`   - DELETE /api/notes/:id    删除笔记`);
    console.log(`   - GET    /api/search       搜索笔记`);
    console.log(`   - GET    /api/meta/stats   统计信息`);
    console.log(`   - GET    /api/meta/tags    标签列表`);
    console.log(`   - GET    /api/meta/folders 文件夹列表`);
    console.log(`   - GET    /health           健康检查`);
    console.log(`\n💾 运行模式：${dbConnected ? '数据库模式' : '文件系统（无数据库）'}`);
  });

  // 优雅关闭
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 收到信号 ${signal}，正在关闭服务器...`);
    
    server.close(async () => {
      console.log('🔌 HTTP 服务器已关闭');
      
      // 停止文件监控
      await fileWatcher.stop();
      console.log('👁️  文件监控已停止');
      
      // 停止自动保存
      await autoSaveService.stopAll();
      console.log('💾 自动保存已停止');
      
      console.log('👋 服务器已完全关闭');
      process.exit(0);
    });

    // 强制关闭超时
    setTimeout(() => {
      console.error('⚠️ 强制关闭服务器');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// 启动服务器
main().catch(error => {
  console.error('💥 服务器启动失败:', error);
  process.exit(1);
});
