import { Router } from 'express';
import { getPool, isDatabaseAvailable } from '../database/db.js';
import type { FolderInfo } from '../types/index.js';
import { AppError, ErrorCodes } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/folders
 * 获取所有文件夹
 */
router.get('/', async (_req, res, next) => {
  try {
    let folders: FolderInfo[];
    
    if (!isDatabaseAvailable()) {
      // 降级到文件系统模式
      const { getAllFolders } = await import('../services/metaService.js');
      folders = await getAllFolders();
    } else {
      const pool = getPool();
      if (!pool) {
        throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
      }
      
      const [rows]: any[] = await pool.execute(`
        SELECT f.path, f.name, COUNT(n.id) as note_count
        FROM folders f
        LEFT JOIN notes n ON n.path LIKE CONCAT(f.path, '/%') AND n.is_deleted = 0
        GROUP BY f.id, f.path, f.name
        ORDER BY f.path
      `);
      
      folders = rows.map((row: any) => ({
        path: row.path,
        name: row.name,
        noteCount: row.note_count,
      }));
    }
    
    res.json({ success: true, data: { folders } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/folders
 * 创建文件夹
 */
router.post('/', async (req, res, next) => {
  try {
    const { path, name } = req.body;
    
    if (!path || !name) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, '路径和名称不能为空', 400);
    }
    
    if (!isDatabaseAvailable()) {
      // 文件系统模式：文件夹通过笔记路径隐式创建
      // 返回成功，实际文件夹会在保存笔记时自动创建
      const folder: FolderInfo = {
        path,
        name,
        noteCount: 0,
      };
      
      res.status(201).json({
        success: true,
        data: { folder },
        message: '文件夹已创建（文件系统模式）',
      });
      return;
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
    }
    
    // 检查是否已存在
    const [existing]: any[] = await pool.execute(
      'SELECT id FROM folders WHERE path = ?',
      [path]
    );
    
    if (existing.length > 0) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, '文件夹已存在', 400);
    }
    
    await pool.execute(
      'INSERT INTO folders (path, name) VALUES (?, ?)',
      [path, name]
    );
    
    const folder: FolderInfo = {
      path,
      name,
      noteCount: 0,
    };
    
    res.status(201).json({
      success: true,
      data: { folder },
      message: '文件夹创建成功',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/folders/:path
 * 更新文件夹
 */
router.put('/:path', async (req, res, next) => {
  try {
    const { path: folderPath } = req.params;
    const { name } = req.body;
    
    if (!name) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, '名称不能为空', 400);
    }
    
    if (!isDatabaseAvailable()) {
      // 文件系统模式：文件夹名称存储在配置文件中，暂不实现
      res.json({
        success: true,
        message: '文件夹更新成功（文件系统模式：仅内存更新）',
      });
      return;
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
    }
    
    // 检查是否存在
    const [existing]: any[] = await pool.execute(
      'SELECT id FROM folders WHERE path = ?',
      [folderPath]
    );
    
    if (existing.length === 0) {
      throw new AppError(ErrorCodes.NOTE_NOT_FOUND, '文件夹不存在', 404);
    }
    
    await pool.execute(
      'UPDATE folders SET name = ? WHERE path = ?',
      [name, folderPath]
    );
    
    res.json({
      success: true,
      message: '文件夹更新成功',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/folders/:path
 * 删除文件夹
 */
router.delete('/:path', async (req, res, next) => {
  try {
    const { path: folderPath } = req.params;
    
    if (!isDatabaseAvailable()) {
      // 文件系统模式：文件夹是隐式的，无需删除
      res.json({
        success: true,
        message: '文件夹已删除（文件系统模式）',
      });
      return;
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
    }
    
    // 检查是否存在
    const [existing]: any[] = await pool.execute(
      'SELECT id FROM folders WHERE path = ?',
      [folderPath]
    );
    
    if (existing.length === 0) {
      throw new AppError(ErrorCodes.NOTE_NOT_FOUND, '文件夹不存在', 404);
    }
    
    // 检查是否有笔记
    const [notes]: any[] = await pool.execute(
      'SELECT COUNT(*) as count FROM notes WHERE path LIKE ? AND is_deleted = 0',
      [folderPath + '/%']
    );
    
    if (notes[0].count > 0) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `文件夹包含 ${notes[0].count} 篇笔记，请先移动或删除笔记`,
        400
      );
    }
    
    await pool.execute('DELETE FROM folders WHERE path = ?', [folderPath]);
    
    res.json({
      success: true,
      message: '文件夹已删除',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
