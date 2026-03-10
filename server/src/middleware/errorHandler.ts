import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse, ApiError } from '../types/index.js';
import config from '../config/index.js';

/**
 * 常见错误代码
 */
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
}

/**
 * 自定义应用错误
 */
export class AppError extends Error {
  code: string;
  status: number;
  details?: Record<string, any>;

  constructor(code: string, message: string, status: number = 500, details?: Record<string, any>) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'AppError';
  }
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(_req: Request, res: Response, _next: NextFunction) {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `接口不存在`,
    },
  };
  res.status(404).json(response);
}

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ 错误:', err);

  if (err instanceof AppError) {
    const error: ApiError = {
      code: err.code,
      message: err.message,
      details: err.details,
    };

    const response: ApiResponse = {
      success: false,
      error,
    };

    res.status(err.status).json(response);
    return;
  }

  // 处理 mysql2 错误
  if ((err as any).code?.startsWith('ER_')) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: '数据库操作失败',
        details: config.env === 'development' ? { mysqlError: (err as any).code } : undefined,
      },
    };
    res.status(500).json(response);
    return;
  }

  // 默认错误处理
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.env === 'development' ? err.message : '服务器内部错误',
    },
  };

  res.status(500).json(response);
}
