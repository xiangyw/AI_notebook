import { Router } from 'express';
import * as noteService from '../services/noteService.js';
import type { CreateNoteInput, UpdateNoteInput, ApiResponse, ListQueryParams } from '../types/index.js';
import { ErrorCodes, AppError } from '../middleware/index.js';

const router = Router();

/**
 * GET /api/notes
 * 获取笔记列表
 */
router.get('/', async (req, res, next) => {
  try {
    const params: ListQueryParams = {
      path: req.query.path as string,
      recursive: req.query.recursive === 'true',
      sortBy: req.query.sortBy as 'title' | 'updatedAt' | 'createdAt' || 'updatedAt',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
      limit: parseInt(req.query.limit as string) || 100,
      offset: parseInt(req.query.offset as string) || 0,
    };
    
    const { notes, folders } = await noteService.getAllNotes(params);
    
    const response: ApiResponse<{ notes: typeof notes; folders: typeof folders }> = {
      success: true,
      data: { notes, folders },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notes/:id
 * 获取单个笔记
 */
router.get('/:id', async (req, res, next) => {
  try {
    const note = await noteService.getNoteById(req.params.id);
    
    if (!note) {
      throw new AppError(
        ErrorCodes.NOTE_NOT_FOUND,
        '笔记不存在',
        404,
        { noteId: req.params.id }
      );
    }
    
    const response: ApiResponse<typeof note> = {
      success: true,
      data: note,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notes
 * 创建笔记
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, content, path, tags }: CreateNoteInput = req.body;
    
    if (!title || !content) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        '标题和内容不能为空',
        400
      );
    }
    
    const note = await noteService.createNote({ title, content, path, tags });
    
    const response: ApiResponse<typeof note> = {
      success: true,
      data: note,
      message: '笔记创建成功',
    };
    
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notes/:id
 * 更新笔记
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { title, content, path, tags, folderId }: UpdateNoteInput & { folderId?: string } = req.body;
    
    const note = await noteService.updateNote(req.params.id, { title, content, path, tags, folderId } as any);
    
    if (!note) {
      throw new AppError(
        ErrorCodes.NOTE_NOT_FOUND,
        '笔记不存在',
        404,
        { noteId: req.params.id }
      );
    }
    
    const response: ApiResponse<typeof note> = {
      success: true,
      data: note,
      message: '笔记更新成功',
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notes/:id
 * 删除笔记
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await noteService.deleteNote(req.params.id);
    
    if (!deleted) {
      throw new AppError(
        ErrorCodes.NOTE_NOT_FOUND,
        '笔记不存在',
        404,
        { noteId: req.params.id }
      );
    }
    
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: '笔记已删除' },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
