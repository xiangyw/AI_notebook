import { Router } from 'express';
import { searchNotes as searchNotesService } from '../services/searchService.js';
import type { ApiResponse } from '../types/index.js';
import { AppError, ErrorCodes } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/search
 * 全文搜索
 */
router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    
    if (!q) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        '请提供搜索关键词',
        400,
        { parameter: 'q' }
      );
    }
    
    const result = await searchNotesService({
      q,
      inTitle: req.query.inTitle === 'true' || req.query.inTitle === undefined,
      inContent: req.query.inContent === 'true' || req.query.inContent === undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',').map(t => t.trim()) : undefined,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    });
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/search/rebuild
 * 重建搜索索引
 */
router.post('/rebuild', async (_req, res, next) => {
  try {
    const { rebuildSearchIndex } = await import('../services/searchService.js');
    const count = await rebuildSearchIndex();
    
    const response: ApiResponse<{ indexed: number }> = {
      success: true,
      data: { indexed: count },
      message: `搜索索引已重建，共索引 ${count} 篇笔记`,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
