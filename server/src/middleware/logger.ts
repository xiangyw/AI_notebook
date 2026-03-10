import type { Request, Response, NextFunction } from 'express';

/**
 * 请求日志中间件
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // 记录请求
  console.log(`📥 ${req.method} ${req.path}`);
  
  // 记录响应
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
    
    console.log(`  ${statusColor} ${status} - ${duration}ms`);
  });
  
  next();
}

/**
 * 简化的日志中间件（用于生产环境）
 */
export function simpleLogger(req: Request, _res: Response, next: NextFunction) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
}
