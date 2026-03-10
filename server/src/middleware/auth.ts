import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, ErrorCodes } from './errorHandler.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'notebook-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * 验证 JWT Token 中间件
 */
export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        '未提供认证令牌',
        401
      );
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: number; 
      username: string; 
      email: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new AppError(
        ErrorCodes.UNAUTHORIZED,
        '认证令牌无效或已过期',
        401
      ));
    } else {
      next(error);
    }
  }
}

/**
 * 可选认证中间件（有 token 则验证，没有也允许访问）
 */
export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        id: number; 
        username: string; 
        email: string;
      };
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Token 无效时忽略，继续处理请求
    next();
  }
}

/**
 * 生成 JWT Token
 */
export function generateToken(user: { id: number; username: string; email: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * 验证 Token
 */
export function verifyToken(token: string): { id: number; username: string; email: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; username: string; email: string };
}
