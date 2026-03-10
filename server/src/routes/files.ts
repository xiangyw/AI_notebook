import { Router } from 'express';
import { fileWatcher } from '../services/fileWatcher.js';
import { autoSaveService } from '../services/autoSave.js';
import type { ApiResponse } from '../types/index.js';
import { AppError, ErrorCodes } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/files/watch/status
 * 获取文件监控状态
 */
router.get('/watch/status', (_req, res) => {
  const status = fileWatcher.getStatus();
  
  const response: ApiResponse<typeof status> = {
    success: true,
    data: status,
  };
  
  res.json(response);
});

/**
 * POST /api/files/watch/start
 * 启动文件监控
 */
router.post('/watch/start', (_req, res) => {
  try {
    fileWatcher.start();
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: '文件监控已启动' },
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '启动文件监控失败',
    };
    res.status(500).json(response);
  }
});

/**
 * POST /api/files/watch/stop
 * 停止文件监控
 */
router.post('/watch/stop', async (_req, res) => {
  try {
    await fileWatcher.stop();
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: '文件监控已停止' },
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: '停止文件监控失败',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/files/autosave/status
 * 获取自动保存状态
 */
router.get('/autosave/status', (_req, res) => {
  const status = autoSaveService.getStatus();
  
  const response: ApiResponse<typeof status> = {
    success: true,
    data: status,
  };
  
  res.json(response);
});

/**
 * POST /api/files/autosave/start
 * 开始自动保存笔记
 */
router.post('/autosave/start', async (req, res, next) => {
  try {
    const { noteId, content } = req.body;
    
    if (!noteId || !content) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'noteId 和 content 不能为空',
        400
      );
    }
    
    autoSaveService.startAutoSave(noteId, content);
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: '自动保存已启动' },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/files/autosave/stop
 * 停止自动保存
 */
router.post('/autosave/stop', async (req, res, next) => {
  try {
    const { noteId } = req.body;
    
    if (!noteId) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'noteId 不能为空',
        400
      );
    }
    
    autoSaveService.stopAutoSave(noteId);
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: '自动保存已停止' },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/files/autosave/flush
 * 立即保存笔记
 */
router.post('/autosave/flush', async (req, res, next) => {
  try {
    const { noteId } = req.body;
    
    if (!noteId) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'noteId 不能为空',
        400
      );
    }
    
    const saved = await autoSaveService.flush(noteId);
    
    const response: ApiResponse<{ saved: boolean }> = {
      success: true,
      data: { saved },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/autosave/recover
 * 恢复未保存的笔记
 */
router.get('/autosave/recover', async (_req, res, next) => {
  try {
    const recovered = await autoSaveService.recoverUnsavedNotes();
    
    const response: ApiResponse<{ entries: typeof recovered }> = {
      success: true,
      data: { entries: recovered },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/files/autosave/cleanup
 * 清理自动保存文件
 */
router.post('/autosave/cleanup', async (req, res, next) => {
  try {
    const { noteId } = req.body;
    
    if (!noteId) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'noteId 不能为空',
        400
      );
    }
    
    await autoSaveService.cleanup(noteId);
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: '自动保存文件已清理' },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
