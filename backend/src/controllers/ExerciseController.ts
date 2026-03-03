import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ExerciseService } from '../services/fitness/ExerciseService';
import { ExerciseCategory, Difficulty } from '@prisma/client';

export class ExerciseController {
  private exerciseService: ExerciseService;

  constructor() {
    this.exerciseService = new ExerciseService();
  }

  /**
   * GET /api/v1/exercises
   */
  getExercises = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.exerciseService.getExercises({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        category: req.query.category as ExerciseCategory | undefined,
        difficulty: req.query.difficulty as Difficulty | undefined,
        muscleGroups: req.query.muscleGroups
          ? (req.query.muscleGroups as string).split(',')
          : undefined,
        equipment: req.query.equipment ? (req.query.equipment as string).split(',') : undefined,
        search: req.query.search as string | undefined,
        isCustom: req.query.isCustom === 'true' ? true : req.query.isCustom === 'false' ? false : undefined,
        createdBy: req.query.createdBy ? Number(req.query.createdBy) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/exercises/:id
   */
  getExerciseById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exerciseId = parseInt(req.params.id, 10);
      const exercise = await this.exerciseService.getExerciseById(
        exerciseId,
        req.user?.userId
      );

      res.status(200).json({ exercise });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/exercises
   */
  createExercise = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const exercise = await this.exerciseService.createExercise(req.user.userId, req.body);

      res.status(201).json({
        message: 'Exercise created successfully',
        exercise,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/exercises/:id
   */
  updateExercise = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const exerciseId = parseInt(req.params.id, 10);
      const exercise = await this.exerciseService.updateExercise(
        req.user.userId,
        exerciseId,
        req.body
      );

      res.status(200).json({
        message: 'Exercise updated successfully',
        exercise,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/exercises/:id
   */
  deleteExercise = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const exerciseId = parseInt(req.params.id, 10);
      const result = await this.exerciseService.deleteExercise(req.user.userId, exerciseId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/exercises/meta/categories
   */
  getCategories = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.exerciseService.getCategories();
      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/exercises/meta/muscle-groups
   */
  getMuscleGroups = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const muscleGroups = await this.exerciseService.getMuscleGroups();
      res.status(200).json({ muscleGroups });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/exercises/meta/equipment
   */
  getEquipment = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const equipment = await this.exerciseService.getEquipment();
      res.status(200).json({ equipment });
    } catch (error) {
      next(error);
    }
  };
}
