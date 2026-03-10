import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { notesRouter, searchRouter, metaRouter, filesRouter, authRouter, foldersRouter, tagsRouter } from './routes/index.js';
import { requestLogger, simpleLogger, notFoundHandler, errorHandler } from './middleware/index.js';
import { fileWatcher, autoSaveService } from './services/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // CORS 配置
  app.use(cors({
    origin: config.env === 'development' ? '*' : process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // 解析 JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 请求日志
  app.use(config.env === 'development' ? requestLogger : simpleLogger);

  // 健康检查
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: config.env,
    });
  });

  // API 路由
  app.use('/api/auth', authRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/meta', metaRouter);
  app.use('/api/files', filesRouter);
  app.use('/api/folders', foldersRouter);
  app.use('/api/tags', tagsRouter);

  // API 根路径
  app.get('/api', (_req, res) => {
    res.json({
      name: 'Notebook API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        notes: '/api/notes',
        folders: '/api/folders',
        tags: '/api/tags',
        search: '/api/search',
        meta: '/api/meta',
        files: '/api/files',
        health: '/health',
      },
    });
  });

  // 初始化文件服务
  fileWatcher.start();
  autoSaveService.init().catch(err => console.error('自动保存初始化失败:', err));

  // 静态文件服务（前端）- 放在 API 路由之后
  const staticPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(staticPath));

  // 前端路由 fallback（SPA 支持）- 放在最后
  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: staticPath });
  });

  // 404 处理
  app.use(notFoundHandler);

  // 全局错误处理
  app.use(errorHandler);

  return app;
}

export default createApp;
