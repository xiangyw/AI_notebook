import { Router } from 'express';
import * as metaService from '../services/metaService.js';
import type { ApiResponse } from '../types/index.js';
import { AppError, ErrorCodes } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/meta/stats
 * 获取统计信息
 */
router.get('/stats', async (_req, res, next) => {
  try {
    const stats = await metaService.getStats();
    
    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/meta/tags
 * 获取所有标签
 */
router.get('/tags', async (_req, res, next) => {
  try {
    const tags = await metaService.getAllTags();
    
    const response: ApiResponse<{ tags: typeof tags }> = {
      success: true,
      data: { tags },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/meta/tags/:name
 * 获取单个标签信息
 */
router.get('/tags/:name', async (req, res, next) => {
  try {
    const tag = await metaService.getTagByName(req.params.name);
    
    if (!tag) {
      throw new AppError(
        ErrorCodes.NOTE_NOT_FOUND,
        '标签不存在',
        404,
        { tagName: req.params.name }
      );
    }
    
    const response: ApiResponse<typeof tag> = {
      success: true,
      data: tag,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/meta/folders
 * 获取所有文件夹
 */
router.get('/folders', async (_req, res, next) => {
  try {
    const folders = await metaService.getAllFolders();
    
    const response: ApiResponse<{ folders: typeof folders }> = {
      success: true,
      data: { folders },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/meta/tags/cleanup
 * 清理未使用的标签
 */
router.post('/tags/cleanup', async (_req, res, next) => {
  try {
    const { cleanupUnusedTags } = await import('../services/metaService.js');
    const deletedCount = await cleanupUnusedTags();
    
    const response: ApiResponse<{ deleted: number }> = {
      success: true,
      data: { deleted: deletedCount },
      message: `已清理 ${deletedCount} 个未使用的标签`,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
