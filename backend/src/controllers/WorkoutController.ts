import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { WorkoutService } from '../services/fitness/WorkoutService';
import { WorkoutType, WorkoutStatus, Intensity } from '@prisma/client';

export class WorkoutController {
  private workoutService: WorkoutService;

  constructor() {
    this.workoutService = new WorkoutService();
  }

  /**
   * GET /api/v1/workouts
   */
  getWorkouts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result = await this.workoutService.getUserWorkouts(req.user.userId, {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        goalId: req.query.goalId ? Number(req.query.goalId) : undefined,
        workoutType: req.query.workoutType as WorkoutType | undefined,
        status: req.query.status as WorkoutStatus | undefined,
        intensity: req.query.intensity as Intensity | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/workouts/stats
   */
  getWorkoutStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await this.workoutService.getWorkoutStats(req.user.userId);

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/workouts/:id
   */
  getWorkoutById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workoutId = parseInt(req.params.id, 10);
      const workout = await this.workoutService.getWorkoutById(req.user.userId, workoutId);

      res.status(200).json({ workout });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/workouts
   */
  createWorkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workout = await this.workoutService.createWorkout(req.user.userId, req.body);

      res.status(201).json({
        message: 'Workout created successfully',
        workout,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/workouts/:id
   */
  updateWorkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workoutId = parseInt(req.params.id, 10);
      const workout = await this.workoutService.updateWorkout(
        req.user.userId,
        workoutId,
        req.body
      );

      res.status(200).json({
        message: 'Workout updated successfully',
        workout,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/workouts/:id/complete
   */
  completeWorkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workoutId = parseInt(req.params.id, 10);
      const workout = await this.workoutService.completeWorkout(req.user.userId, workoutId, req.body);

      res.status(200).json({
        message: 'Workout completed successfully',
        workout,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/workouts/:id
   */
  deleteWorkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workoutId = parseInt(req.params.id, 10);
      const result = await this.workoutService.deleteWorkout(req.user.userId, workoutId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
