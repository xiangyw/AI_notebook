import { Router } from 'express';
import { getPool, isDatabaseAvailable } from '../database/db.js';
import type { TagInfo } from '../types/index.js';
import { AppError, ErrorCodes } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/tags
 * 获取所有标签
 */
router.get('/', async (_req, res, next) => {
  try {
    let tags: TagInfo[];
    
    if (!isDatabaseAvailable()) {
      // 降级到文件系统模式
      const { getAllTags } = await import('../services/metaService.js');
      tags = await getAllTags();
    } else {
      const pool = getPool();
      if (!pool) {
        throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
      }
      
      const [rows]: any[] = await pool.execute(`
        SELECT t.name, COUNT(nt.note_id) as count
        FROM tags t
        LEFT JOIN note_tags nt ON t.id = nt.tag_id
        GROUP BY t.id, t.name
        ORDER BY count DESC, t.name ASC
      `);
      
      tags = rows.map((row: any) => ({
        name: row.name,
        count: row.count,
      }));
    }
    
    res.json({ success: true, data: { tags } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tags
 * 创建标签
 */
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, '标签名称不能为空', 400);
    }
    
    if (!isDatabaseAvailable()) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库不可用', 503);
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
    }
    
    // 使用 INSERT ... ON DUPLICATE KEY UPDATE 获取或创建标签
    await pool.execute(
      'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
      [name]
    );
    
    const tag: TagInfo = {
      name,
      count: 0,
    };
    
    res.status(201).json({
      success: true,
      data: { tag },
      message: '标签创建成功',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tags/:name
 * 更新标签
 */
router.put('/:name', async (req, res, next) => {
  try {
    const { name: oldName } = req.params;
    const { name: newName } = req.body;
    
    if (!newName) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, '新标签名称不能为空', 400);
    }
    
    if (!isDatabaseAvailable()) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库不可用', 503);
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
    }
    
    // 检查旧标签是否存在
    const [existing]: any[] = await pool.execute(
      'SELECT id FROM tags WHERE name = ?',
      [oldName]
    );
    
    if (existing.length === 0) {
      throw new AppError(ErrorCodes.NOTE_NOT_FOUND, '标签不存在', 404);
    }
    
    // 更新标签名称
    await pool.execute(
      'UPDATE tags SET name = ? WHERE name = ?',
      [newName, oldName]
    );
    
    res.json({
      success: true,
      message: '标签更新成功',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tags/:name
 * 删除标签
 */
router.delete('/:name', async (req, res, next) => {
  try {
    const { name: tagName } = req.params;
    
    if (!isDatabaseAvailable()) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库不可用', 503);
    }
    
    const pool = getPool();
    if (!pool) {
      throw new AppError(ErrorCodes.DATABASE_ERROR, '数据库连接失败', 503);
    }
    
    // 检查标签是否存在
    const [existing]: any[] = await pool.execute(
      'SELECT id FROM tags WHERE name = ?',
      [tagName]
    );
    
    if (existing.length === 0) {
      throw new AppError(ErrorCodes.NOTE_NOT_FOUND, '标签不存在', 404);
    }
    
    // 删除标签关联（会自动删除，因为有 ON DELETE CASCADE）
    await pool.execute('DELETE FROM tags WHERE name = ?', [tagName]);
    
    res.json({
      success: true,
      message: '标签已删除',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
