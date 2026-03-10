import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getPool, isDatabaseAvailable } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';
import { AppError, ErrorCodes } from '../middleware/errorHandler.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // 验证输入
    if (!username || !email || !password) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        '用户名、邮箱和密码不能为空',
        400
      );
    }
    
    if (password.length < 6) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        '密码长度至少为 6 位',
        400
      );
    }
    
    // 检查数据库是否可用
    if (!isDatabaseAvailable()) {
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        '数据库不可用，无法注册',
        503
      );
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        '数据库连接失败',
        503
      );
    }
    
    // 检查用户是否已存在
    const [existing]: any[] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existing.length > 0) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        '用户名或邮箱已被使用',
        400
      );
    }
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // 创建用户
    const [result]: any = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    
    const userId = result.insertId;
    
    // 生成 Token
    const token = generateToken({
      id: userId,
      username,
      email,
    });
    
    const response: ApiResponse<{ token: string; user: { id: number; username: string; email: string } }> = {
      success: true,
      data: {
        token,
        user: { id: userId, username, email },
      },
      message: '注册成功',
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // 验证输入
    if (!email || !password) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        '邮箱和密码不能为空',
        400
      );
    }
    
    // 检查数据库是否可用
    if (!isDatabaseAvailable()) {
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        '数据库不可用，无法登录',
        503
      );
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        '数据库连接失败',
        503
      );
    }
    
    // 查找用户
    const [users]: any[] = await pool.execute(
      'SELECT id, username, email, password_hash FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        '邮箱或密码错误',
        401
      );
    }
    
    const user = users[0];
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        '邮箱或密码错误',
        401
      );
    }
    
    // 生成 Token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    
    const response: ApiResponse<{ token: string; user: { id: number; username: string; email: string } }> = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      message: '登录成功',
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', async (req, res, next) => {
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
    const { id } = await import('jsonwebtoken').then(jwt => jwt.verify(token, process.env.JWT_SECRET || 'notebook-jwt-secret-change-in-production')) as { id: number };
    
    if (!isDatabaseAvailable()) {
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        '数据库不可用',
        503
      );
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(
        ErrorCodes.DATABASE_ERROR,
        '数据库连接失败',
        503
      );
    }
    
    const [users]: any[] = await pool.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        '用户不存在',
        404
      );
    }
    
    const user = users[0];
    
    const response: ApiResponse<{ id: number; username: string; email: string; createdAt: Date }> = {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
